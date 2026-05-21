@extends('layouts.public')

@section('title', 'Academics')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ACADEMIC PROGRAMS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Academics</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Academics Intro Section -->
    <section class="gt-about-section-4 section-padding fix">
        <div class="container">
            <div class="gt-section-title text-center">
                <h6 class="wow fadeInUp gt-style-4">OUR PROGRAMS</h6>
                <h2 class="wow splt-txt" data-splitting="">A COMPREHENSIVE CURRICULUM FOR EVERY STAGE</h2>
            </div>
            <div class="row g-4 mt-4">
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/01.jpg') }}" alt="Primary Education">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">Primary Education (Ages 5–11)</a></h3>
                            <p>Our primary programme builds foundational literacy, numeracy, science, and social skills through inquiry-based, play-driven learning.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/02.jpg') }}" alt="Secondary School">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">Secondary School (Ages 12–15)</a></h3>
                            <p>Students gain rigorous academic depth across core subjects, guided by specialist teachers and enriched through clubs and labs.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".6s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/03.jpg') }}" alt="High School">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">High School &amp; Advanced Placements (Ages 16–18)</a></h3>
                            <p>Preparing students for university and beyond, our high school curriculum includes A-Level equivalents and accelerated science programmes.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/04.jpg') }}" alt="Arts & Music">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">Performing Arts &amp; Music</a></h3>
                            <p>A full creative arts programme including drama, visual arts, choir, orchestra, and digital media production.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/about/about-01.jpg') }}" alt="STEM">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">STEM &amp; Technology</a></h3>
                            <p>Robotics, coding bootcamps, AI labs, and engineering clubs empower our students to become tomorrow's innovators.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                    <div class="service-item">
                        <div class="service-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/about/about-02.jpg') }}" alt="Sports">
                        </div>
                        <div class="service-content">
                            <h3><a href="#">Sports &amp; Physical Education</a></h3>
                            <p>Championship-level sports training in football, basketball, swimming, athletics, and more, with full coaching staff.</p>
                            <div class="service-btn">
                                <a href="{{ route('course-details') }}" class="gt-link-btn">Learn More <i class="fa-solid fa-chevrons-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="cta-section-4">
        <div class="container">
            <div class="cta-contact-wrapper-4">
                <div class="shape"><img src="{{ asset('template/oxford/assets/img/home-4/cta-shape.png') }}" alt="shape"></div>
                <div class="cta-contact-left">
                    <div class="gt-section-title">
                        <h2 class="text-white wow fadeInUp" data-wow-delay=".3s">Ready to Enroll Your Child?<br>Admissions Open Now</h2>
                    </div>
                    <div class="icon-items mt-4 wow fadeInUp" data-wow-delay=".5s">
                        <div class="content">
                            <p>Call Our Admissions Office</p>
                            <h5><a href="tel:+441865123456">+44 1865 123456</a></h5>
                        </div>
                    </div>
                </div>
                <div class="contact-image wow fadeInUp" data-wow-delay=".4s">
                    <img src="{{ asset('template/oxford/assets/img/home-4/cta.png') }}" alt="Oxford School">
                </div>
            </div>
        </div>
    </section>

@endsection
