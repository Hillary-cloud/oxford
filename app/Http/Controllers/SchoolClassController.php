<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'classes']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'classes']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:school_classes,name',
            'level' => 'nullable|string|max:255',
            'arm_ids' => 'sometimes|array',
            'arm_ids.*' => 'exists:class_arms,id',
        ]);

        $class = \App\Models\SchoolClass::create([
            'name' => $validated['name'],
            'level' => $validated['level'] ?? null,
        ]);

        if (!empty($validated['arm_ids'])) {
            $class->arms()->sync($validated['arm_ids']);
        }

        return redirect()->route('academic-setup.index', ['tab' => 'classes'])->with('success', 'Class created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return redirect()->route('academic-setup.index', ['tab' => 'classes']);
    }

    /**
     * Assign a form teacher to a class section.
     */
    public function assignFormTeacher(Request $request, string $class_id)
    {
        $validated = $request->validate([
            'class_section_id' => 'required|exists:class_sections,id',
            'form_teacher_id' => 'nullable|exists:users,id',
        ]);

        $section = \App\Models\ClassSection::findOrFail($validated['class_section_id']);
        $section->update(['form_teacher_id' => $validated['form_teacher_id']]);

        return redirect()->back()->with('success', 'Form teacher assigned successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return redirect()->route('academic-setup.index', ['tab' => 'classes']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $class = \App\Models\SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:school_classes,name,' . $id,
            'level' => 'nullable|string|max:255',
            'arm_ids' => 'sometimes|array',
            'arm_ids.*' => 'exists:class_arms,id',
        ]);

        $class->update([
            'name' => $validated['name'] ?? $class->name,
            'level' => $validated['level'] ?? $class->level,
        ]);

        if (isset($validated['arm_ids'])) {
            $class->arms()->sync($validated['arm_ids']);
        }

        return redirect()->route('academic-setup.index', ['tab' => 'classes'])->with('success', 'Class updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $class = \App\Models\SchoolClass::findOrFail($id);

        if ($class->students()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete class. It has enrolled students.');
        }

        if (\App\Models\Result::whereHas('classSection', function ($query) use ($id) {
            $query->where('school_class_id', $id);
        })->exists()) {
            return redirect()->back()->with('error', 'Cannot delete class. It has associated results.');
        }

        $class->delete();

        return redirect()->route('academic-setup.index', ['tab' => 'classes'])->with('success', 'Class deleted successfully.');
    }
}
