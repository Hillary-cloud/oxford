<?php

namespace App\Http\Controllers;

use App\Models\ResultSetting;
use App\Models\Grade;
use App\Models\PsychomotorSkillCategory;
use App\Models\PsychomotorSkill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Results', [
            'caConfig' => ResultSetting::getByKey('ca_config', [
                ['name' => '1st CA', 'max_score' => 20],
                ['name' => '2nd CA', 'max_score' => 20],
            ]),
            'reportCardSettings' => array_merge([
                'show_next_term_fee' => true,
                'show_next_term_begin' => true,
                'show_next_term_end' => true,
                'show_class_highest' => true,
                'show_class_lowest' => true,
                'show_class_average' => true,
                'require_principal_signature' => true,
                'require_form_teacher_signature' => true,
            ], ResultSetting::getByKey('report_card_settings', [])),
            'psychomotorSettings' => ResultSetting::getByKey('psychomotor_settings', [
                ['scale' => 5, 'desc' => 'Excellent'],
                ['scale' => 4, 'desc' => 'Good'],
                ['scale' => 3, 'desc' => 'Fair'],
                ['scale' => 2, 'desc' => 'Poor'],
                ['scale' => 1, 'desc' => 'Very Poor'],
            ]),
            'grades' => Grade::orderBy('min_score', 'desc')->get(),
            'psychomotorCategories' => PsychomotorSkillCategory::with('skills')->get(),
        ]);
    }

    public function updateCAConfig(Request $request)
    {
        $validated = $request->validate([
            'config' => 'required|array',
            'config.*.name' => 'required|string',
            'config.*.max_score' => 'required|integer|min:0',
        ]);

        ResultSetting::setByKey('ca_config', $validated['config']);

        return redirect()->back()->with('success', 'Operation successful.');
    }

    public function updatePsychomotorSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.scale' => 'required|integer',
            'settings.*.desc' => 'required|string',
        ]);

        ResultSetting::setByKey('psychomotor_settings', $validated['settings']);

        return redirect()->back()->with('success', 'Psychomotor settings updated.');
    }

    public function updateReportCardSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.next_term_begin' => 'nullable|date',
            'settings.annual_ranking_basis' => 'nullable|string|in:class,arm',
            'settings.principal_name' => 'nullable|string|max:255',
            'settings.form_teacher_name' => 'nullable|string|max:255',
        ]);

        // Use input() to get all settings, including those not explicitly validated (like booleans)
        // Validation above ensures 'settings' is an array.
        $safeSettings = $request->input('settings');
        
        $existingSettings = ResultSetting::getByKey('report_card_settings', []);
        $newSettings = array_merge($existingSettings, $safeSettings);

        ResultSetting::setByKey('report_card_settings', $newSettings);

        return redirect()->back()->with('success', 'Report Card settings updated.');
    }

    public function storeGrade(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'min_score' => 'required|integer|min:0|max:100',
            'max_score' => 'required|integer|min:0|max:100',
            'remarks' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        Grade::create($validated);

        return redirect()->back()->with('success', 'Grade created.');
    }

    public function destroyGrade(Grade $grade)
    {
        $grade->delete();
        return redirect()->back()->with('success', 'Grade deleted.');
    }

    public function storePsychomotorCategory(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        PsychomotorSkillCategory::create(['name' => $request->name]);
        return redirect()->back()->with('success', 'Category added.');
    }

    public function storePsychomotorSkill(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:psychomotor_skill_categories,id',
            'name' => 'required|string',
        ]);
        PsychomotorSkill::create($request->all());
        return redirect()->back()->with('success', 'Skill added.');
    }

    public function destroyPsychomotorCategory($id)
    {
        PsychomotorSkillCategory::destroy($id);
        return redirect()->back()->with('success', 'Category deleted.');
    }

    public function destroyPsychomotorSkill($id)
    {
        PsychomotorSkill::destroy($id);
        return redirect()->back()->with('success', 'Skill deleted.');
    }
}
