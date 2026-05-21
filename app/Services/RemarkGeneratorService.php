<?php

namespace App\Services;

class RemarkGeneratorService
{
    /**
     * Generate a Form Teacher remark based on average.
     */
    public function generateFormTeacherRemark($average, $term1Avg = null, $term2Avg = null, $term3Avg = null)
    {
        if ($average >= 85) {
            return $this->random([
                "An outstanding performance! Keep it up.",
                "Excellent result. You are a star!",
                "Brilliant work. You have made us proud.",
                "Exceptional performance in all subjects."
            ]);
        } elseif ($average >= 70) {
            return $this->random([
                "A very good result. Keep up the good work.",
                "Impressive performance. Aim higher next time.",
                "Great job! You are doing very well.",
                "Good result. Consistency is key."
            ]);
        } elseif ($average >= 60) {
            return $this->random([
                "A good attempt. You can do better.",
                "Above average performance. Put in more effort.",
                "Good result, but there is room for improvement.",
                "Steady progress. Keep working hard."
            ]);
        } elseif ($average >= 50) {
            return $this->random([
                "An average performance. You need to work harder.",
                "You have passed, but you can do better.",
                "Fair result. More focus is required.",
                "You are capable of better results. Wake up!"
            ]);
        } else {
            return $this->random([
                "A poor result. Please sit up!",
                "Below average performance. Determine to do better.",
                "You need to be more serious with your studies.",
                "Disappointing result. Hard work is required."
            ]);
        }
    }

    /**
     * Generate a Principal remark based on average and status.
     */
    public function generatePrincipalRemark($average, $status = 'Promoted')
    {
        if ($average >= 85) {
            return "An excellent result. Highly commended.";
        } elseif ($average >= 70) {
            return "A very good result. Promoting excellence.";
        } elseif ($average >= 50) {
            return "A fair result. Needs to improve.";
        } else {
            return "A poor result. Advice to repeat.";
        }
    }

    private function random($array)
    {
        return $array[array_rand($array)];
    }
}
