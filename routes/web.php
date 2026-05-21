<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\TermController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\ClassArmController;
use App\Http\Controllers\AcademicSetupController;
use App\Http\Controllers\ResultSettingController;
use App\Http\Controllers\ResultManagementController;
use App\Http\Controllers\ResultPinController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StaffAttendanceController;
use App\Http\Controllers\SchoolAccountController;
use App\Http\Controllers\StudentSubjectAssignmentController;
use App\Http\Controllers\FeeTypeController;
use App\Http\Controllers\FeeGroupController;
use App\Http\Controllers\FeePaymentController;
use App\Http\Controllers\FeeReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Public Routes
Route::get('/', function () {
    return view('public.home');
})->name('home');

Route::get('/about', function () {
    return view('public.about');
})->name('about');

Route::get('/services', function () {
    return view('public.services');
})->name('services');

Route::get('/contact', function () {
    return view('public.contact');
})->name('contact');

Route::get('/teachers', function () {
    return view('public.teachers');
})->name('teachers');

Route::get('/teacher-details', function () {
    return view('public.teachers-details');
})->name('teacher-details');

Route::get('/events', function () {
    return view('public.event');
})->name('events');

Route::get('/blog', function () {
    return view('public.blog');
})->name('blog');

Route::get('/blog-single', function () {
    return view('public.blog-single');
})->name('blog-single');

Route::get('/gallery', function () {
    return view('public.gallery');
})->name('gallery');

Route::get('/faq', function () {
    return view('public.faq');
})->name('faq');

Route::get('/pricing', function () {
    return view('public.pricing');
})->name('pricing');

Route::get('/course-details', function () {
    return view('public.course-details');
})->name('course-details');

Route::get('/404', function () {
    return view('public.404');
})->name('404');


Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    // User Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|create user']], function () {
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|view user']], function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/{id}', [UserController::class, 'show'])->name('users.show');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|manage user']], function () {
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('users/bulk-update-status', [UserController::class, 'bulkUpdateStatus'])->name('users.bulk-update-status');
        Route::post('users/bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
    });

    Route::resource('roles', RoleController::class);
    
    // Student Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|create student']], function () {
        Route::get('students/create', [StudentController::class, 'create'])->name('students.create');
        Route::post('students', [StudentController::class, 'store'])->name('students.store');
        Route::get('students/import', [StudentController::class, 'import'])->name('students.import');
        Route::post('students/import', [StudentController::class, 'storeBulk'])->name('students.import.store');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|view student']], function () {
        Route::get('students', [StudentController::class, 'index'])->name('students.index');
        Route::get('students/{student}', [StudentController::class, 'show'])->name('students.show');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|manage student']], function () {
        Route::post('students/bulk-delete', [StudentController::class, 'bulkDelete'])->name('students.bulk-delete');
        Route::get('students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
        Route::match(['put', 'patch'], 'students/{student}', [StudentController::class, 'update'])->name('students.update');
        Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
    });


    // Promotion Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage promotions']], function () {
        Route::get('promotions', [\App\Http\Controllers\PromotionController::class, 'index'])->name('promotions.index');
        Route::post('promotions', [\App\Http\Controllers\PromotionController::class, 'promote'])->name('promotions.promote');
        Route::post('promotions/decision/update', [\App\Http\Controllers\PromotionController::class, 'updateDecision'])->name('promotions.decision.update');
        Route::post('promotions/decision/bulk-update', [\App\Http\Controllers\PromotionController::class, 'bulkUpdateDecisions'])->name('promotions.decision.bulk-update');
        Route::post('promotions/compute-annual', [\App\Http\Controllers\PromotionController::class, 'computeAnnual'])->name('promotions.compute-annual');
        Route::post('promotions/update-rule', [\App\Http\Controllers\PromotionController::class, 'updateRule'])->name('promotions.update-rule');
        Route::post('promotions/finalize', [\App\Http\Controllers\PromotionController::class, 'finalize'])->name('promotions.finalize');
        Route::post('promotions/reset', [\App\Http\Controllers\PromotionController::class, 'reset'])->name('promotions.reset');
        Route::post('promotions/lock', [\App\Http\Controllers\PromotionController::class, 'lock'])->name('promotions.lock');
    });

    // Graduation Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage graduations']], function () {
        Route::get('graduations', [\App\Http\Controllers\GraduationController::class, 'index'])->name('graduations.index');
        Route::post('graduations', [\App\Http\Controllers\GraduationController::class, 'store'])->name('graduations.store');
    });

    // Subject Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|view subject']], function () {
        Route::get('subjects', [SubjectController::class, 'index'])->name('subjects.index');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|create subject']], function () {
        Route::get('subjects/create', [SubjectController::class, 'create'])->name('subjects.create');
        Route::post('subjects', [SubjectController::class, 'store'])->name('subjects.store');
    });

    Route::group(['middleware' => ['role_or_permission:Super Admin|manage subject']], function () {
        Route::get('subjects/{subject}/edit', [SubjectController::class, 'edit'])->name('subjects.edit');
        Route::match(['put', 'patch'], 'subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
        Route::delete('subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');
    });
    
    // Result Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|view results|manage results']], function () {
        Route::get('results/compilation', [ResultController::class, 'compilation'])->name('results.compilation');
        Route::post('results/compilation', [ResultController::class, 'storeBulk'])->name('results.store-bulk');
        Route::get('results/psychomotor', function() {
            return redirect()->route('results.management', ['active_tab' => 'psychomotor']);
        })->name('results.psychomotor.index');
        Route::post('results/psychomotor/store', [ResultManagementController::class, 'storePsychomotor'])->name('results.psychomotor.store');
        Route::get('results/management', [ResultManagementController::class, 'index'])->name('results.management');
        Route::post('results/management/publish', [ResultManagementController::class, 'publishResults'])->name('results.management.publish');
        Route::post('results/terminal-remarks', [ResultController::class, 'storeTerminalRemarks'])->name('results.terminal-remarks.store');
        Route::get('results/report-cards', function() {
            return redirect()->route('results.management', ['active_tab' => 'report-cards']);
        })->name('results.report-cards.index');
        Route::get('results/report-card/{student}', [ResultController::class, 'reportCard'])->name('results.report-card');
        Route::get('results/bulk-report-card', [ResultController::class, 'bulkReportCard'])->name('results.bulk-report-card');
        Route::get('results/annual-report-card/{student}', [ResultController::class, 'annualReportCard'])->name('results.annual-report-card');
        Route::get('results/bulk-annual-report-card', [ResultController::class, 'bulkAnnualReportCard'])->name('results.bulk-annual-report-card');
        Route::get('results/broadsheet', [ResultController::class, 'broadsheet'])->name('results.broadsheet');
        Route::post('results/annual-remarks', [ResultController::class, 'storeAnnualRemarks'])->name('results.annual-remarks.store');
    });

    // We can keep specific post/actions under manage permissions if needed, 
    // but typically compilation/management view is enough access control for now unless specified.
    
    // Redirect the index route to management, while keeping other resource routes
    Route::get('results', function() {
        return redirect()->route('results.management');
    })->name('results.index');
    Route::resource('results', ResultController::class)->except(['index']);
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage result pins']], function () {
        Route::post('result-pins/get-students', [ResultPinController::class, 'getStudents'])->name('result-pins.get-students');
        Route::post('result-pins/check-existence', [ResultPinController::class, 'checkExistence'])->name('result-pins.check-existence');
        Route::post('result-pins/preview-sms', [ResultPinController::class, 'previewSms'])->name('result-pins.preview-sms');
        Route::post('result-pins/send-sms', [ResultPinController::class, 'sendSms'])->name('result-pins.send-sms');
        Route::resource('result-pins', ResultPinController::class)->only(['index', 'store', 'destroy']);
    });
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage setup']], function () {
        Route::resource('academic-sessions', AcademicSessionController::class);
        Route::resource('terms', TermController::class);
        Route::resource('classes', SchoolClassController::class);
        Route::post('classes/{class}/assign-form-teacher', [SchoolClassController::class, 'assignFormTeacher'])->name('classes.assign-form-teacher');
        Route::resource('class-arms', ClassArmController::class);
        Route::get('academic-setup', [AcademicSetupController::class, 'index'])->name('academic-setup.index');
        // Student Elective Subject Assignments
        Route::post('student-subject-assignments/get-students', [StudentSubjectAssignmentController::class, 'getStudents'])->name('student-subject-assignments.get-students');
        Route::post('student-subject-assignments', [StudentSubjectAssignmentController::class, 'store'])->name('student-subject-assignments.store');
    });
    
    // Section Subject Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage subject']], function () {
        Route::get('sections/{class_section}/subjects', [\App\Http\Controllers\ClassSectionSubjectController::class, 'edit'])->name('sections.subjects.edit');
        Route::match(['put', 'patch'], 'sections/{class_section}/subjects', [\App\Http\Controllers\ClassSectionSubjectController::class, 'update'])->name('sections.subjects.update');
    });

    // Attendance Management
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index')->middleware('role_or_permission:Super Admin|view attendance|take attendance');
    Route::group(['middleware' => ['role_or_permission:Super Admin|take attendance']], function () {
        Route::get('attendance/take', [AttendanceController::class, 'take'])->name('attendance.take');
        Route::post('attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::get('attendance/history', [AttendanceController::class, 'history'])->name('attendance.history');
        Route::get('attendance/get-students/{classSection}', [AttendanceController::class, 'getStudents'])->name('attendance.get-students');
        Route::post('attendance/bulk-store', [AttendanceController::class, 'bulkStore'])->name('attendance.bulk-store');
    });

    // Staff Attendance (QR System)
    Route::group(['prefix' => 'staff-attendance', 'as' => 'staff-attendance.'], function () {
        // Monitor (Admin only)
        Route::group(['middleware' => ['role_or_permission:Super Admin|view staff attendance monitor']], function () {
            Route::get('/monitor', [StaffAttendanceController::class, 'monitor'])->name('monitor');
            Route::get('/token', [StaffAttendanceController::class, 'generateToken'])->name('generate-token');
        });

        // Logs (Admin/Super Admin)
        Route::get('/logs', [StaffAttendanceController::class, 'index'])->name('index')->middleware('role_or_permission:Super Admin|view staff attendance logs');

        // Scanning (Teachers/Staff)
        Route::get('/scan', [StaffAttendanceController::class, 'scan'])->name('scan')->middleware('role_or_permission:Super Admin|mark staff attendance');
        Route::match(['get', 'post'], '/clock-in-out', [StaffAttendanceController::class, 'clockInOut'])->name('clock-in-out')->middleware('role_or_permission:Super Admin|mark staff attendance');
    });

    // -------------------------------------------------------
    // Fees Management
    // -------------------------------------------------------
    Route::prefix('fees')->name('fees.')->group(function () {
        // Dashboard
        Route::get('/', [FeePaymentController::class, 'dashboard'])->name('index')->middleware('role_or_permission:Super Admin|view fees');

        // School Accounts
        Route::resource('accounts', SchoolAccountController::class)->except(['create', 'edit', 'show'])->middleware('role_or_permission:Super Admin|manage school accounts');

        // Fee Types & Assignments
        Route::group(['middleware' => ['role_or_permission:Super Admin|manage fee types']], function () {
            Route::get('types', [FeeTypeController::class, 'index'])->name('types.index');
            Route::post('types', [FeeTypeController::class, 'store'])->name('types.store');
            Route::put('types/{feeType}', [FeeTypeController::class, 'update'])->name('types.update');
            Route::delete('types/{feeType}', [FeeTypeController::class, 'destroy'])->name('types.destroy');
            Route::post('types/{feeType}/assignments', [FeeTypeController::class, 'storeAssignment'])->name('types.assignments.store');
            Route::delete('assignments/{assignment}', [FeeTypeController::class, 'destroyAssignment'])->name('assignments.destroy');
        });

        // Fee Groups
        Route::group(['middleware' => ['role_or_permission:Super Admin|manage fee groups']], function () {
            Route::get('groups', [FeeGroupController::class, 'index'])->name('groups.index');
            Route::post('groups', [FeeGroupController::class, 'store'])->name('groups.store');
            Route::put('groups/{feeGroup}', [FeeGroupController::class, 'update'])->name('groups.update');
            Route::delete('groups/{feeGroup}', [FeeGroupController::class, 'destroy'])->name('groups.destroy');
            Route::post('groups/{feeGroup}/students', [FeeGroupController::class, 'addStudents'])->name('groups.students.add');
            Route::delete('groups/{feeGroup}/students/{student}', [FeeGroupController::class, 'removeStudent'])->name('groups.students.remove');
        });

        // Payments
        Route::get('payments', [FeePaymentController::class, 'index'])->name('payments.index')->middleware('role_or_permission:Super Admin|view fees');
        Route::get('students/{student}/ledger', [FeePaymentController::class, 'studentLedger'])->name('students.ledger')->middleware('role_or_permission:Super Admin|view fees');
        Route::get('payments/{payment}', [FeePaymentController::class, 'show'])->name('payments.show')->middleware('role_or_permission:Super Admin|view fees|record payments');
        Route::get('payments/{payment}/receipt', [FeePaymentController::class, 'receipt'])->name('payments.receipt')->middleware('role_or_permission:Super Admin|view fees|record payments');

        Route::group(['middleware' => ['role_or_permission:Super Admin|record payments']], function () {
            Route::get('payments/record', [FeePaymentController::class, 'create'])->name('payments.create');
            Route::post('payments', [FeePaymentController::class, 'store'])->name('payments.store');
        });

        // Reports
        Route::group(['middleware' => ['role_or_permission:Super Admin|generate fee reports']], function () {
            Route::get('reports', [FeeReportController::class, 'index'])->name('reports.index');
            Route::get('reports/export', [FeeReportController::class, 'export'])->name('reports.export');
        });
    });

    // Result Settings & Configuration
    Route::get('settings/results', [ResultSettingController::class, 'index'])->name('settings.results.index');
        Route::post('settings/results/ca-update', [ResultSettingController::class, 'updateCAConfig'])->name('settings.results.ca-update');
        Route::post('settings/results/report-update', [ResultSettingController::class, 'updateReportCardSettings'])->name('settings.results.report-update');
        Route::post('settings/results/psychomotor-settings-update', [ResultSettingController::class, 'updatePsychomotorSettings'])->name('settings.results.psychomotor-settings-update');
        Route::post('settings/results/grade-store', [ResultSettingController::class, 'storeGrade'])->name('settings.results.grade-store');
    Route::delete('settings/results/grades/{grade}', [ResultSettingController::class, 'destroyGrade'])->name('settings.results.grade-destroy');
    Route::post('settings/results/psychomotor-categories', [ResultSettingController::class, 'storePsychomotorCategory'])->name('settings.results.psychomotor-category-store');
    Route::delete('settings/results/psychomotor-categories/{id}', [ResultSettingController::class, 'destroyPsychomotorCategory'])->name('settings.results.psychomotor-category-destroy');
    Route::post('settings/results/psychomotor-skills', [ResultSettingController::class, 'storePsychomotorSkill'])->name('settings.results.psychomotor-skill-store');
    Route::delete('settings/results/psychomotor-skills/{id}', [ResultSettingController::class, 'destroyPsychomotorSkill'])->name('settings.results.psychomotor-skill-destroy');

    // General Settings
    Route::get('settings/general', [\App\Http\Controllers\GeneralSettingController::class, 'index'])->name('settings.general.index');
    Route::post('settings/general', [\App\Http\Controllers\GeneralSettingController::class, 'update'])->name('settings.general.update');

    // ID Card Management
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage id card']], function () {
        Route::get('id-cards', [\App\Http\Controllers\IdCardController::class, 'index'])->name('id-cards.index');
        Route::post('id-cards/settings', [\App\Http\Controllers\IdCardController::class, 'storeSettings'])->name('id-cards.settings');
    });
    
    // CBT Student Login (Guest)
    Route::get('cbt/login', [\App\Http\Controllers\CbtLoginController::class, 'showLoginForm'])->name('cbt.login');
    Route::post('cbt/login', [\App\Http\Controllers\CbtLoginController::class, 'login'])->name('cbt.login.submit');
    Route::post('cbt/logout', [\App\Http\Controllers\CbtLoginController::class, 'logout'])->name('cbt.logout')->middleware('auth');

    // CBT Management (Teachers/Admins)
    Route::group(['middleware' => ['role_or_permission:Super Admin|manage cbt']], function () {
        Route::get('cbt/questions/download-sample', [\App\Http\Controllers\CbtController::class, 'downloadSample'])->name('cbt.questions.download-sample');
        Route::patch('cbt/exams/{exam}/publish', [\App\Http\Controllers\CbtController::class, 'togglePublish'])->name('cbt.exams.publish');
        Route::post('cbt/exams/{exam}/sync-results', [\App\Http\Controllers\CbtController::class, 'syncToResults'])->name('cbt.exams.sync-results');
        Route::resource('cbt/exams', \App\Http\Controllers\CbtController::class)->names('cbt.exams');
        Route::get('cbt/exams/{exam}/questions', [\App\Http\Controllers\CbtController::class, 'questions'])->name('cbt.exams.questions');
        Route::post('cbt/exams/{exam}/questions', [\App\Http\Controllers\CbtController::class, 'storeQuestion'])->name('cbt.exams.questions.store');
        Route::put('cbt/exams/questions/{question}', [\App\Http\Controllers\CbtController::class, 'updateQuestion'])->name('cbt.exams.questions.update');
        Route::delete('cbt/exams/questions/{question}', [\App\Http\Controllers\CbtController::class, 'destroyQuestion'])->name('cbt.exams.questions.destroy');
        Route::post('cbt/exams/{exam}/questions/bulk-upload', [\App\Http\Controllers\CbtController::class, 'bulkUploadQuestions'])->name('cbt.exams.questions.bulk-upload');
        Route::get('cbt/exams/{exam}/results', [\App\Http\Controllers\CbtController::class, 'results'])->name('cbt.exams.results');
    });

});

// Student CBT Interface (Protected by Session)
Route::middleware([\App\Http\Middleware\EnsureStudentLoggedIn::class])->prefix('student/cbt')->name('student.cbt.')->group(function () {
    Route::get('/', [\App\Http\Controllers\CbtStudentController::class, 'index'])->name('index');
    Route::get('/exam/{exam}', [\App\Http\Controllers\CbtStudentController::class, 'show'])->name('show');
    Route::match(['get', 'post'], '/exam/{exam}/start', [\App\Http\Controllers\CbtStudentController::class, 'start'])->name('start');
    Route::post('/exam/{exam}/sync', [\App\Http\Controllers\CbtStudentController::class, 'sync'])->name('sync');
    Route::post('/exam/{exam}/submit', [\App\Http\Controllers\CbtStudentController::class, 'submit'])->name('submit');
});

// Photo Capture Portal Routes
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('login', [\App\Http\Controllers\PhotoCaptureController::class, 'login'])->name('login');
    Route::post('authenticate', [\App\Http\Controllers\PhotoCaptureController::class, 'authenticate'])->name('authenticate');
    
    // Protected by controller middleware check, or we could add specific middleware here 
    // For simplicity, controller checks session
    Route::get('capture', [\App\Http\Controllers\PhotoCaptureController::class, 'index'])->name('capture');
    Route::get('search', [\App\Http\Controllers\PhotoCaptureController::class, 'search'])->name('search');
    Route::post('upload', [\App\Http\Controllers\PhotoCaptureController::class, 'upload'])->name('upload');
    Route::post('logout', [\App\Http\Controllers\PhotoCaptureController::class, 'logout'])->name('logout');
});

// Public Result Checker
Route::get('/result-checker', [App\Http\Controllers\ResultCheckerController::class, 'index'])->name('result-checker.index');
Route::post('/result-checker', [App\Http\Controllers\ResultCheckerController::class, 'check'])->name('result-checker.check')->middleware('throttle:5,1');

// Public ID Card Verification
Route::get('/verify-id/{uuid}', [\App\Http\Controllers\IdCardController::class, 'verify'])->name('id-cards.verify');

require __DIR__.'/auth.php';
