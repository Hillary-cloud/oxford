<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassArm;
use App\Models\ClassSection;
use App\Models\SchoolClass;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicSetupController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('AcademicSetup/Index', [
            'sessions' => AcademicSession::with('terms')->orderBy('name', 'desc')->get(),
            'terms' => Term::with('academicSession')->orderBy('name')->get(),
            'classes' => SchoolClass::with([
                'arms',
                'sections.classArm',
                'sections.formTeacher',
                'sections.sectionSubjects.subject',
                'sections.sectionSubjects.teacher'
            ])->orderBy('level')->orderBy('name')->get(),
            'arms' => ClassArm::withCount('sections')->orderBy('name')->get(),
            'availableArms' => ClassArm::orderBy('name')->get(),
            'currentSession' => AcademicSession::where('is_current', true)->first() ?? AcademicSession::latest()->first(),
            'allSubjects' => \App\Models\Subject::orderBy('name')->get(),
            'teachers' => \App\Models\User::role(['Teacher', 'Admin'])->orderBy('name')->get(),
            'active_tab' => $request->query('tab', 'sessions'),
            // For Subject Assignment tab
            'classSectionsForAssignment' => ClassSection::with(['schoolClass', 'classArm'])
                ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
                ->orderBy('school_classes.level')
                ->orderBy('school_classes.name')
                ->select('class_sections.*')
                ->get(),
        ]);
    }
}

