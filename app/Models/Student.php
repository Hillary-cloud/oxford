<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Graduation;

class Student extends Model
{
    use HasUuids, HasFactory;
    
    protected $fillable = [
        'registration_number',
        'surname',
        'othername',
        'gender',
        'date_of_birth',
        'profile_picture',
        'address',
        'guardian_name',
        'guardian_number',
        'guardian_email',
        'class_section_id',
        'academic_session_id',
        'status',
        'user_id'
    ];

    /**
     * Interact with the student's surname.
     */
    protected function surname(): Attribute
    {
        return Attribute::make(
            get: fn (string|null $value) => $value ? strtoupper($value) : $value,
            set: fn (string|null $value) => $value ? strtoupper($value) : $value,
        );
    }

    /**
     * Interact with the student's othername.
     */
    protected function othername(): Attribute
    {
        return Attribute::make(
            get: fn (string|null $value) => $value ? strtoupper($value) : $value,
            set: fn (string|null $value) => $value ? strtoupper($value) : $value,
        );
    }

    protected $appends = ['profile_picture_url'];

    /**
     * Get the student's profile picture URL.
     */
    protected function profilePictureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->profile_picture 
                ? asset('storage/' . $this->profile_picture) 
                : null,
        );
    }

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public function psychomotorRatings(): HasMany
    {
        return $this->hasMany(StudentPsychomotorRating::class);
    }

    public function terminalRemarks(): HasMany
    {
        return $this->hasMany(TerminalRemark::class);
    }

    public function annualResults(): HasMany
    {
        return $this->hasMany(AnnualResult::class);
    }

    public function promotionDecisions(): HasMany
    {
        return $this->hasMany(PromotionDecision::class);
    }
    public function graduation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Graduation::class);
    }

    public function feePayments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    public function feeGroups(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(FeeGroup::class, 'student_fee_groups')->withTimestamps();
    }

    public function electiveSubjectAssignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudentSubjectAssignment::class);
    }

    public function electiveSubjects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'student_subject_assignments', 'student_id', 'subject_id')
            ->withPivot(['class_section_id', 'academic_session_id'])
            ->withTimestamps();
    }
}
