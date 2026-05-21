<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TermController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'terms']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'terms']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean'
        ]);

        if ($request->input('is_current')) {
            \App\Models\Term::query()->update(['is_current' => false]);
        }

        \App\Models\Term::create($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'terms'])->with('success', 'Term created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return redirect()->route('academic-setup.index', ['tab' => 'terms']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $term = \App\Models\Term::findOrFail($id);

        $validated = $request->validate([
            'academic_session_id' => 'sometimes|exists:academic_sessions,id',
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean'
        ]);

        if ($request->input('is_current')) {
             \App\Models\Term::where('id', '!=', $id)->update(['is_current' => false]);
        }

        $term->update($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'terms'])->with('success', 'Term updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $term = \App\Models\Term::findOrFail($id);

        if (\App\Models\Result::where('term_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete term. It has associated results.');
        }

        if (\App\Models\TerminalRemark::where('term_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete term. It has terminal remark records.');
        }

        if (\App\Models\StudentPsychomotorRating::where('term_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete term. It has psychomotor rating records.');
        }

        $term->delete();

        return redirect()->route('academic-setup.index', ['tab' => 'terms'])->with('success', 'Term deleted successfully.');
    }
}
