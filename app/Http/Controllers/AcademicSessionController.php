<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AcademicSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'sessions']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'sessions']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean'
        ]);

        if ($request->input('is_current')) {
            \App\Models\AcademicSession::query()->update(['is_current' => false]);
        }

        \App\Models\AcademicSession::create($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'sessions'])->with('success', 'Academic Session created successfully.');
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
        return redirect()->route('academic-setup.index', ['tab' => 'sessions']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $session = \App\Models\AcademicSession::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean'
        ]);

        if ($request->input('is_current')) {
            \App\Models\AcademicSession::where('id', '!=', $id)->update(['is_current' => false]);
        }

        $session->update($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'sessions'])->with('success', 'Academic Session updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $session = \App\Models\AcademicSession::findOrFail($id);

        // Check for dependencies
        if ($session->terms()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has associated terms.');
        }

        if (\App\Models\Student::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has registered students.');
        }

        if (\App\Models\Result::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has associated results.');
        }

        if (\App\Models\AnnualResult::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has annual result records.');
        }

        if (\App\Models\Graduation::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has graduation records.');
        }

        if (\App\Models\PromotionDecision::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has promotion decisions.');
        }

        if (\App\Models\TerminalRemark::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has terminal remark records.');
        }

        if (\App\Models\StudentPsychomotorRating::where('academic_session_id', $id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete session. It has psychomotor rating records.');
        }

        $session->delete();

        return redirect()->route('academic-setup.index', ['tab' => 'sessions'])->with('success', 'Academic Session deleted successfully.');
    }
}
