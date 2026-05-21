<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Edit Result') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <form action="{{ route('results.update', $result->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Read-only Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Details</h4>
                                <p><strong>Student:</strong> {{ $result->student->first_name }} {{ $result->student->last_name }}</p>
                                <p><strong>Subject:</strong> {{ $result->subject->name }}</p>
                                <p><strong>Session:</strong> {{ $result->academicSession->name }}</p>
                                <p><strong>Term:</strong> {{ $result->term->name }}</p>
                            </div>

                            <!-- Score Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Update Scores</h4>
                                <div class="mb-4">
                                    <label for="ca_score" class="block text-sm font-medium text-gray-700">CA Score (Max 40)</label>
                                    <input type="number" step="0.1" name="ca_score" id="ca_score" value="{{ $result->ca_score }}" min="0" max="40" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="exam_score" class="block text-sm font-medium text-gray-700">Exam Score (Max 60)</label>
                                    <input type="number" step="0.1" name="exam_score" id="exam_score" value="{{ $result->exam_score }}" min="0" max="60" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="remarks" class="block text-sm font-medium text-gray-700">Remarks</label>
                                    <input type="text" name="remarks" id="remarks" value="{{ $result->remarks }}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end mt-6">
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Result</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
