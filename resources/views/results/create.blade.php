<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Add Result') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <form action="{{ route('results.store') }}" method="POST">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Selection Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Student & Subject</h4>
                                <div class="mb-4">
                                    <label for="student_id" class="block text-sm font-medium text-gray-700">Student</label>
                                    <select name="student_id" id="student_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($students as $student)
                                            <option value="{{ $student->id }}">{{ $student->first_name }} {{ $student->last_name }} ({{ $student->admission_number }})</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="subject_id" class="block text-sm font-medium text-gray-700">Subject</label>
                                    <select name="subject_id" id="subject_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($subjects as $subject)
                                            <option value="{{ $subject->id }}">{{ $subject->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="academic_session_id" class="block text-sm font-medium text-gray-700">Academic Session</label>
                                    <select name="academic_session_id" id="academic_session_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($sessions as $session)
                                            <option value="{{ $session->id }}" {{ $session->is_current ? 'selected' : '' }}>{{ $session->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="term_id" class="block text-sm font-medium text-gray-700">Term</label>
                                    <select name="term_id" id="term_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($terms as $term)
                                            <option value="{{ $term->id }}" {{ $term->is_current ? 'selected' : '' }}>{{ $term->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <!-- Score Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Scores</h4>
                                <div class="mb-4">
                                    <label for="ca_score" class="block text-sm font-medium text-gray-700">CA Score (Max 40)</label>
                                    <input type="number" step="0.1" name="ca_score" id="ca_score" min="0" max="40" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="exam_score" class="block text-sm font-medium text-gray-700">Exam Score (Max 60)</label>
                                    <input type="number" step="0.1" name="exam_score" id="exam_score" min="0" max="60" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="remarks" class="block text-sm font-medium text-gray-700">Remarks</label>
                                    <input type="text" name="remarks" id="remarks" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end mt-6">
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Result</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
