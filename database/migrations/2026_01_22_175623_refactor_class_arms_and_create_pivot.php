<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Fetch all existing data before we do anything destructive
        $oldArms = DB::table('class_arms')->get();
        
        // 2. Prepare class_sections table (ensure it's fresh)
        Schema::dropIfExists('class_sections');
        Schema::create('class_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('school_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignUuid('class_arm_id')->nullable(); // Will be hooked up later
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['school_class_id', 'class_arm_id']);
        });

        // 3. Clear class_arms but keep unique names
        $uniqueNames = $oldArms->pluck('name')->unique()->values();
        
        Schema::disableForeignKeyConstraints();
        DB::table('class_arms')->truncate();
        Schema::enableForeignKeyConstraints();
        
        // 4. Re-insert unique standalone arms
        $nameToNewArmId = [];
        foreach ($uniqueNames as $name) {
            $armId = (string) Str::uuid();
            DB::table('class_arms')->insert([
                'id' => $armId,
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $nameToNewArmId[$name] = $armId;
        }

        // 5. Create sections and update references
        foreach ($oldArms as $oldArm) {
            if (empty($oldArm->school_class_id)) continue; // Skip if we lost the class association
            if (!isset($nameToNewArmId[$oldArm->name])) continue;

            $newArmId = $nameToNewArmId[$oldArm->name];
            $sectionId = (string) Str::uuid();

            // Create section
            DB::table('class_sections')->insert([
                'id' => $sectionId,
                'school_class_id' => $oldArm->school_class_id,
                'class_arm_id' => $newArmId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update students and results
            DB::table('students')->where('class_arm_id', $oldArm->id)->update(['class_arm_id' => $sectionId]);
            DB::table('results')->where('class_arm_id', $oldArm->id)->update(['class_arm_id' => $sectionId]);
        }

        // 6. Finalize class_arms table structure
        Schema::table('class_arms', function (Blueprint $table) {
            // SQLite doesn't support dropping columns with foreign keys easily
            if (DB::getDriverName() !== 'sqlite') {
                if (Schema::hasColumn('class_arms', 'school_class_id')) {
                    $table->dropForeign(['school_class_id']);
                    $table->dropUnique(['school_class_id', 'name']);
                    $table->dropColumn('school_class_id');
                }
            }
            // Unique name is fine
            try {
                $table->unique('name');
            } catch (\Exception $e) {
                // Ignore if unique already exists or SQLite fails
            }
        });

        // 7. Add foreign key to class_sections
        Schema::table('class_sections', function (Blueprint $table) {
            $table->foreign('class_arm_id')->references('id')->on('class_arms')->onDelete('cascade');
        });

        // 8. Rename columns in students and results
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('class_arm_id', 'class_section_id');
        });
        Schema::table('results', function (Blueprint $table) {
            $table->renameColumn('class_arm_id', 'class_section_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            $table->renameColumn('class_section_id', 'class_arm_id');
        });
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('class_section_id', 'class_arm_id');
        });

        Schema::dropIfExists('class_sections');
        
        // This is complex to reverse perfectly without more logic, 
        // but for dev it should be okay to just drop the unique and add column.
        Schema::table('class_arms', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->uuid('school_class_id')->nullable();
        });
    }
};
