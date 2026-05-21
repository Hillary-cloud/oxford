<?php

namespace App\Services;

use App\Models\GeneralSetting;
use App\Models\Student;
use App\Models\User;

class IdGeneratorService
{
    /**
     * Generate a new Student Registration Number.
     * Format: SCHOOL_CODE/STU/YEAR/SEQUENCE (e.g., HUSS/STU/2025/001)
     */
    public function generateStudentId()
    {
        $identity = GeneralSetting::get('school_identity');
        $schoolCode = $identity['school_code'] ?? 'SCH';
        $year = $identity['current_registration_year'] ?? date('Y');

        // Prefix base
        $prefix = "{$schoolCode}/STU/{$year}/";

        // Find the latest student with this prefix to determine sequence
        $latestStudent = Student::where('registration_number', 'like', "{$prefix}%")
            ->orderBy('registration_number', 'desc')
            ->first();

        if ($latestStudent) {
            // Extract sequence number
            $parts = explode('/', $latestStudent->registration_number);
            $lastSequence = end($parts);
            $nextSequence = intval($lastSequence) + 1;
        } else {
            $nextSequence = 1;
        }

        // Pad with leading zeros (e.g., 001)
        $sequenceStr = str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

        return $prefix . $sequenceStr;
    }

    /**
     * Generate a new Staff ID.
     * Format: SCHOOL_CODE/STAFF/SEQUENCE (e.g., HUSS/STAFF/047)
     */
    public function generateStaffId()
    {
        $identity = GeneralSetting::get('school_identity');
        $schoolCode = $identity['school_code'] ?? 'SCH';

        $prefix = "{$schoolCode}/STAFF/";

        // Find latest user with staff_id matching pattern
        $latestStaff = User::where('staff_id', 'like', "{$prefix}%")
            ->orderBy('staff_id', 'desc')
            ->first();

        if ($latestStaff) {
            $parts = explode('/', $latestStaff->staff_id);
            $lastSequence = end($parts);
            $nextSequence = intval($lastSequence) + 1;
        } else {
            $nextSequence = 1;
        }

        $sequenceStr = str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

        return $prefix . $sequenceStr;
    }
}
