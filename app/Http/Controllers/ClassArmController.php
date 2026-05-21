<?php

namespace App\Http\Controllers;

use App\Models\ClassArm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassArmController extends Controller
{
    public function index()
    {
        return redirect()->route('academic-setup.index', ['tab' => 'arms']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:class_arms,name',
        ]);

        ClassArm::create($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'arms'])->with('success', 'Class Arm created successfully.');
    }

    public function update(Request $request, ClassArm $classArm)
    {
        if ($classArm->name === 'No arm') {
            return redirect()->back()->with('error', 'The "No arm" option cannot be modified.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:class_arms,name,' . $classArm->id,
        ]);

        $classArm->update($validated);

        return redirect()->route('academic-setup.index', ['tab' => 'arms'])->with('success', 'Class Arm updated successfully.');
    }

    public function destroy(ClassArm $classArm)
    {
        if ($classArm->name === 'No arm') {
            return redirect()->back()->with('error', 'The "No arm" option cannot be deleted.');
        }

        if ($classArm->students()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete arm. It has enrolled students.');
        }

        if ($classArm->results()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete arm. It has associated results.');
        }

        $classArm->delete();

        return redirect()->route('academic-setup.index', ['tab' => 'arms'])->with('success', 'Class Arm deleted successfully.');
    }
}
