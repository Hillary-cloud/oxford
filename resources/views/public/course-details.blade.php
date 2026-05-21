@extends('layouts.public')

@section('title', 'Admissions')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ADMISSIONS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Admissions</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Admissions Intro -->
    <section class="gt-about-section-4 section-padding fix">
        <div class="container">
            <div class="row g-4 align-items-center">
                <div class="col-lg-6">
                    <div class="gt-about-content">
                        <div class="gt-section-title mb-0">
                            <h6 class="wow fadeInUp gt-style-4">JOIN OUR FAMILY</h6>
                            <h2 class="wow splt-txt" data-splitting="">ADMISSIONS OPEN FOR 2026–27</h2>
                        </div>
                        <p class="gt-about-text wow fadeInUp" data-wow-delay=".5s">Oxford School welcomes applications from students who demonstrate intellectual curiosity, ethical character, and the motivation to thrive in our dynamic academic environment.</p>
                        <ul class="gt-about-list wow fadeInUp" data-wow-delay=".3s">
                            <li><i class="fa-solid fa-chevrons-right"></i> Applications accepted year-round</li>
                            <li><i class="fa-solid fa-chevrons-right"></i> Scholarships available for exceptional students</li>
                            <li><i class="fa-solid fa-chevrons-right"></i> Boarding and day student options</li>
                            <li><i class="fa-solid fa-chevrons-right"></i> Bursaries available for eligible families</li>
                        </ul>
                        <div class="gt-about-button wow fadeInUp" data-wow-delay=".3s">
                            <a href="{{ route('contact') }}" class="gt-theme-btn style-2">
                                <span class="gt-text-btn"><span class="gt-text-2">ENQUIRE NOW <i class="fa-solid fa-arrow-right"></i></span></span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="gt-about-image">
                        <img src="{{ asset('template/oxford/assets/img/home-4/about/about-01.jpg') }}" alt="Admissions" class="wow img-custom-anim-right">
                        <div class="gt-about-image-2 wow img-custom-anim-left">
                            <img src="{{ asset('template/oxford/assets/img/home-4/about/about-02.jpg') }}" alt="Students">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Steps -->
    <section class="gt-counter-section section-padding section-bg">
        <div class="container">
            <div class="gt-section-title text-center mb-5">
                <h6 class="wow fadeInUp">THE PROCESS</h6>
                <h2 class="wow splt-txt" data-splitting="">HOW TO APPLY IN 4 SIMPLE STEPS</h2>
            </div>
            <div class="row g-4">
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                    <div class="gt-counter-box text-center">
                        <div class="gt-content">
                            <h2><i class="fa-solid fa-file-alt" style="font-size:32px;"></i></h2>
                            <h3 style="font-size:20px; margin-top:10px;">01. Submit Application</h3>
                            <p>Fill out and submit the online admissions form with all required documents.</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                    <div class="gt-counter-box text-center">
                        <div class="gt-content">
                            <h2><i class="fa-solid fa-user-check" style="font-size:32px;"></i></h2>
                            <h3 style="font-size:20px; margin-top:10px;">02. Assessment &amp; Interview</h3>
                            <p>Shortlisted candidates attend an assessment and parent interview session.</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".6s">
                    <div class="gt-counter-box text-center">
                        <div class="gt-content">
                            <h2><i class="fa-solid fa-envelope-open-text" style="font-size:32px;"></i></h2>
                            <h3 style="font-size:20px; margin-top:10px;">03. Admission Offer</h3>
                            <p>Successful applicants receive an official offer letter within 2 weeks.</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".8s">
                    <div class="gt-counter-box text-center">
                        <div class="gt-content">
                            <h2><i class="fa-solid fa-graduation-cap" style="font-size:32px;"></i></h2>
                            <h3 style="font-size:20px; margin-top:10px;">04. Enroll &amp; Induction</h3>
                            <p>Accept the offer, complete enrollment, and attend our welcome induction.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
