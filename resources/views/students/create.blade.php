<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Register Student') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <form action="{{ route('students.store') }}" method="POST">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Personal Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Personal Details</h4>
                                <div class="mb-4">
                                    <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" name="first_name" id="first_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" name="last_name" id="last_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="admission_number" class="block text-sm font-medium text-gray-700">Admission Number</label>
                                    <input type="text" name="admission_number" id="admission_number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label for="gender" class="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" id="gender" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="dob" class="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="dob" id="dob" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                            </div>

                            <!-- Academic & Parent Details -->
                            <div>
                                <h4 class="text-md font-semibold mb-4">Academic & Parent Details</h4>
                                    <div class="mb-4">
                                    <label for="academic_session_id" class="block text-sm font-medium text-gray-700">Admission Session</label>
                                    <select name="academic_session_id" id="academic_session_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($sessions as $session)
                                            <option value="{{ $session->id }}" {{ $session->is_current ? 'selected' : '' }}>{{ $session->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="school_class_id" class="block text-sm font-medium text-gray-700">Class</label>
                                    <select name="school_class_id" id="school_class_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                        @foreach ($classSections as $section)
                                            <option value="{{ $section->id }}">{{ $section->schoolClass?->name }} - {{ $section->classArm?->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label for="parent_name" class="block text-sm font-medium text-gray-700">Parent Name</label>
                                    <input type="text" name="parent_name" id="parent_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="mb-4">
                                    <label for="parent_phone" class="block text-sm font-medium text-gray-700">Parent Phone</label>
                                    <input type="text" name="parent_phone" id="parent_phone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="mb-4">
                                    <label for="parent_email" class="block text-sm font-medium text-gray-700">Parent Email</label>
                                    <input type="email" name="parent_email" id="parent_email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="mb-4">
                                    <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea name="address" id="address" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end mt-6">
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Register Student</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
