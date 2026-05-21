@extends('layouts.public')

@section('title', 'About Us')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ABOUT OXFORD SCHOOL</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>About Us</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- About Section -->
    <section class="gt-about-section fix section-padding">
        <div class="container">
            <div class="gt-about-wrapper">
                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="gt-about-content">
                            <div class="gt-section-title mb-0">
                                <h6 class="wow fadeInUp">About Us</h6>
                                <h2 class="wow splt-txt" data-splitting="">WE ARE LEADERS IN VALUE-BASED MODERN EDUCATION</h2>
                            </div>
                            <p class="gt-about-text wow fadeInUp" data-wow-delay=".5s">Founded on a legacy of excellence, Oxford School is structured to support comprehensive growth. We combine modern academic systems with robust athletic, science, and creative arts clubs to ensure every child discovers their maximum potential.</p>
                            <ul class="gt-about-list wow fadeInUp" data-wow-delay=".3s">
                                <li><i class="fa-solid fa-chevrons-right"></i> Accredited Global Curriculum</li>
                                <li><i class="fa-solid fa-chevrons-right"></i> Highly Qualified Specialist Mentors</li>
                            </ul>
                            <div class="gt-skill-feature-items">
                                <div class="gt-skill-feature wow fadeInUp" data-wow-delay=".3s">
                                    <h3 class="gt-box-title">Academic Achievements</h3>
                                    <div class="gt-progress">
                                        <div class="gt-progress-bar" style="width: 95%;">
                                            <div class="gt-progress-value"><span class="gt-count">95</span>%</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="gt-skill-feature wow fadeInUp" data-wow-delay=".4s">
                                    <h3 class="gt-box-title">University Placements</h3>
                                    <div class="gt-progress">
                                        <div class="gt-progress-bar" style="width: 98%;">
                                            <div class="gt-progress-value"><span class="gt-count">98</span>%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="gt-about-button wow fadeInUp" data-wow-delay=".3s">
                                <a href="{{ route('services') }}" class="gt-theme-btn style-2">
                                    <span class="gt-text-btn"><span class="gt-text-2">OUR PROGRAMS <i class="fa-solid fa-arrow-right"></i></span></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="gt-about-image-items">
                            <div class="gt-about-image wow img-custom-anim-right">
                                <img src="{{ asset('template/oxford/assets/img/home-4/about/about-01.jpg') }}" alt="About Oxford School" class="gt-about-img-1">
                            </div>
                            <div class="gt-about-image-2 wow img-custom-anim-left" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                <img src="{{ asset('template/oxford/assets/img/home-4/about/about-02.jpg') }}" alt="Oxford Students">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Counter Section -->
    <section class="gt-counter-section section-padding section-bg">
        <div class="container">
            <div class="gt-counter-wrapper">
                <div class="row g-4">
                    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                        <div class="gt-counter-box">
                            <div class="gt-content">
                                <h2><span class="gt-count">39</span>+</h2>
                                <p>Annual Graduate<br>Scholars</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                        <div class="gt-counter-box">
                            <div class="gt-content">
                                <h2><span class="gt-count">49</span>+</h2>
                                <p>Dedicated<br>Professors</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".6s">
                        <div class="gt-counter-box">
                            <div class="gt-content">
                                <h2><span class="gt-count">99</span>+</h2>
                                <p>Satisfied<br>Families</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".8s">
                        <div class="gt-counter-box">
                            <div class="gt-content">
                                <h2><span class="gt-count">89</span>+</h2>
                                <p>Educational<br>Awards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Core Values / Purposes Section -->
    <section class="gt-purposes-section fix">
        <div class="container">
            <div class="gt-purposes-wrapper">
                <div class="row g-4 align-items-center">
                    <div class="col-lg-6">
                        <div class="gt-purposes-image">
                            <img src="{{ asset('template/oxford/assets/img/home-4/purposes/purposes-image.jpg') }}" alt="Purpose" class="wow img-custom-anim-left">
                            <div class="gt-circle-box">
                                <a href="{{ route('contact') }}" class="gt-arrow"><i class="fa-solid fa-arrow-right"></i></a>
                                <div class="gt-text-circle">
                                    <img src="{{ asset('template/oxford/assets/img/home-4/text-circle.svg') }}" alt="img">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="gt-purposes-content">
                            <div class="gt-section-title mb-0">
                                <h6 class="text-white wow fadeInUp">OUR CORE VALUES</h6>
                                <h2 class="text-white wow splt-txt" data-splitting="">WHY OXFORD SCHOOL IS THE PREFERRED CHOICE</h2>
                            </div>
                            <p class="text">We believe education is more than classrooms and textbooks; it is about building the framework for a bright, responsible life.</p>
                            <ul class="gt-icon-items">
                                <li class="wow fadeInUp" data-wow-delay=".3s">
                                    <div class="gt-purposes-icon"><i class="fa-solid fa-briefcase"></i></div>
                                    <div class="gt-icon-purposes-content">
                                        <h3>EXPERT MENTORSHIP</h3>
                                        <p>Our educators are internationally certified training experts in early and teen developmental pedagogies.</p>
                                    </div>
                                </li>
                                <li class="wow fadeInUp" data-wow-delay=".5s">
                                    <div class="gt-purposes-icon"><i class="fa-solid fa-building-columns"></i></div>
                                    <div class="gt-icon-purposes-content">
                                        <h3>HIGH-TECH LABS &amp; INFRASTRUCTURE</h3>
                                        <p>Students enjoy premium coding laboratories, complete multi-resource libraries, and complete sports facilities.</p>
                                    </div>
                                </li>
                                <li class="wow fadeInUp" data-wow-delay=".3s">
                                    <div class="gt-purposes-icon"><i class="fa-solid fa-gem"></i></div>
                                    <div class="gt-icon-purposes-content">
                                        <h3>HOLISTIC CHARACTER BUILDING</h3>
                                        <p>Regular leadership assemblies, community events, and social-emotional guidance are part of our syllabus.</p>
                                    </div>
                                </li>
                            </ul>
                            <a href="{{ route('course-details') }}" class="gt-theme-btn wow fadeInUp" data-wow-delay=".5s">
                                <span class="gt-text-btn"><span class="gt-text-2">APPLY TODAY</span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Partner Logos -->
    <div class="gt-brand-section section-padding fix">
        <div class="swiper gt-brand-slider">
            <div class="swiper-wrapper gt-slide-transtion">
                @for ($i = 1; $i <= 6; $i++)
                <div class="swiper-slide gt-brand-slide-element">
                    <div class="brand-image">
                        <img src="{{ asset('template/oxford/assets/img/home-4/brand/brand-0'.$i.'.png') }}" alt="Partner">
                    </div>
                </div>
                @endfor
            </div>
        </div>
    </div>

@endsection
