@extends('layouts.public')

@section('title', 'Our Faculty')

@section('content')

    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">OUR FACULTY</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Our Faculty</li>
                </ul>
            </div>
        </div>
    </div>

    <section class="gt-team-section-4 fix section-padding">
        <div class="container">
            <div class="gt-section-title text-center">
                <h6 class="wow fadeInUp justify-content-center gt-style-4">MEET THE TEAM</h6>
                <h2 class="wow splt-txt" data-splitting="">OUR DEDICATED EDUCATORS &amp; STAFF</h2>
            </div>
            <div class="row">
                @php
                $staff = [
                    ['name'=>'Dr. Richard Sterling','role'=>'School Principal (PhD)','img'=>'team-01.jpg'],
                    ['name'=>'Prof. Elizabeth Vance','role'=>'Vice Principal (MA)','img'=>'team-02.jpg'],
                    ['name'=>'Mr. Arthur Pendelton','role'=>'Dean of Admissions','img'=>'team-03.jpg'],
                    ['name'=>'Dr. Amelia Clarke','role'=>'HOD Sciences (PhD)','img'=>'team-01.jpg'],
                    ['name'=>'Mr. James Okafor','role'=>'HOD Mathematics (MSc)','img'=>'team-02.jpg'],
                    ['name'=>'Coach Marcus Webb','role'=>'Director of Sports','img'=>'team-03.jpg'],
                ];
                @endphp
                @foreach($staff as $i => $member)
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="{{ '.'.($i*2+2).'s' }}">
                    <div class="gt-team-image-4">
                        <img src="{{ asset('template/oxford/assets/img/home-4/team/'.$member['img']) }}" alt="{{ $member['name'] }}">
                        <div class="gt-social-icon">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <div class="gt-team-content">
                            <div class="gt-team-title">
                                <h3><a href="{{ route('teacher-details') }}">{{ $member['name'] }}</a></h3>
                                <p>{{ $member['role'] }}</p>
                            </div>
                            <a href="{{ route('teacher-details') }}" class="arrow-icon"><i class="fa-regular fa-share-nodes"></i></a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </section>

@endsection
