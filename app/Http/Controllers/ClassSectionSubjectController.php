<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassSectionSubjectController extends Controller
{
    /**
     * Show the form for managing subjects of a class section.
     */
    public function edit(string $class_section_id)
    {
        return redirect()->route('academic-setup.index', ['tab' => 'classes']);
    }

    /**
     * Update the subjects for a class section.
     */
    public function update(Request $request, string $class_section_id)
    {
        $classSection = \App\Models\ClassSection::findOrFail($class_section_id);
        
        $validated = $request->validate([
            'subjects' => 'array',
            'subjects.*.id' => 'required|exists:subjects,id',
            'subjects.*.teacher_id' => 'nullable|exists:users,id',
        ]);

        $syncData = [];
        foreach ($validated['subjects'] ?? [] as $item) {
            $syncData[$item['id']] = [
                'id' => (string) \Illuminate\Support\Str::uuid(), // Ensure new pivot IDs if needed, although sync handles existing
                'teacher_id' => $item['teacher_id']
            ];
        }

        $classSection->subjects()->sync($syncData);

        return redirect()->back()->with('success', 'Subjects and teachers updated successfully.');
    }
}
