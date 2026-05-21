@extends('layouts.public')

@section('title', 'Home')

@section('content')

    <!-- Hero Section -->
    <section class="gt-hero-section-4 fix">
        <div class="swiper hero-slider">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <div class="gt-hero-4">
                        <div class="hero-bg bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/home-4/hero/hero-bg.jpg') }}');"></div>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-8">
                                    <div class="gt-hero-content">
                                        <h6 data-animation="slideInRight" data-delay="1.3s">Welcome to Oxford School</h6>
                                        <h1 data-animation="slideInRight" data-delay="1.5s">Inspiring <span>Excellence</span>, Nurturing Character</h1>
                                        <p data-animation="slideInRight" data-delay="1.7s">Oxford School provides a world-class educational environment that empowers students to grow academically, socially, and emotionally. We foster analytical thinkers and global citizens.</p>
                                        <a href="{{ route('course-details') }}" class="gt-theme-btn style-2" data-animation="slideInRight" data-delay="1.3s">
                                            <span class="gt-text-btn"><span class="gt-text-2">EXPLORE ADMISSIONS <i class="fa-solid fa-arrow-right"></i></span></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="gt-hero-4">
                        <div class="hero-bg bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/home-4/hero/hero-bg-2.jpg') }}');"></div>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-8">
                                    <div class="gt-hero-content">
                                        <h6 data-animation="slideInRight" data-delay="1.3s">Legacy of Academic Distinction</h6>
                                        <h1 data-animation="slideInRight" data-delay="1.5s">Preparing the Global Leaders of Tomorrow</h1>
                                        <p data-animation="slideInRight" data-delay="1.7s">Our rigorous curriculum, state-of-the-art laboratories, and highly dedicated faculty work hand-in-hand to provide an environment of true excellence and character development.</p>
                                        <a href="{{ route('services') }}" class="gt-theme-btn style-2" data-animation="slideInRight" data-delay="1.3s">
                                            <span class="gt-text-btn"><span class="gt-text-2">OUR CURRICULUM <i class="fa-solid fa-arrow-right"></i></span></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="gt-hero-4">
                        <div class="hero-bg bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/home-4/hero/hero-bg-3.jpg') }}');"></div>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-8">
                                    <div class="gt-hero-content">
                                        <h6 data-animation="slideInRight" data-delay="1.3s">Holistic Development</h6>
                                        <h1 data-animation="slideInRight" data-delay="1.5s">Beyond the Classroom: Sports, Arts &amp; Tech</h1>
                                        <p data-animation="slideInRight" data-delay="1.7s">We encourage our students to explore their personal passions and artistic talents, build collaborative values, and discover new skills through rich extracurricular programs.</p>
                                        <a href="{{ route('about') }}" class="gt-theme-btn style-2" data-animation="slideInRight" data-delay="1.3s">
                                            <span class="gt-text-btn"><span class="gt-text-2">LEARN MORE <i class="fa-solid fa-arrow-right"></i></span></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="gt-about-section-4 section-padding fix">
        <div class="left-shape float-bob-y">
            <img src="{{ asset('template/oxford/assets/img/home-4/about/left-shape.png') }}" alt="shape">
        </div>
        <div class="container">
            <div class="gt-about-wrapper-4">
                <div class="row g-4 align-items-center">
                    <div class="col-lg-6">
                        <div class="gt-about-content">
                            <div class="gt-section-title mb-0">
                                <h6 class="wow fadeInUp gt-style-4">About Oxford School</h6>
                                <h2 class="wow splt-txt" data-splitting="">Three Decades of Educational Leadership</h2>
                            </div>
                            <p class="gt-about-text wow fadeInUp" data-wow-delay=".5s">Oxford School is committed to providing a top-tier learning environment. Our educational philosophy blends traditional academic foundations with cutting-edge methodologies to empower every student to excel.</p>
                            <ul class="gt-list">
                                <li class="wow fadeInUp" data-wow-delay=".3s">
                                    <span>01.</span>
                                    <div class="gt-content">
                                        <h4>Academic Excellence</h4>
                                        <p>Accredited global syllabus prepared by world-class educators to foster critical analysis.</p>
                                    </div>
                                </li>
                                <li class="wow fadeInUp" data-wow-delay=".5s">
                                    <span>02.</span>
                                    <div class="gt-content">
                                        <h4>Holistic Development</h4>
                                        <p>Comprehensive athletic training, high-tech robotics clubs, creative arts, and music programs.</p>
                                    </div>
                                </li>
                            </ul>
                            <div class="gt-about-button wow fadeInUp" data-wow-delay=".5s">
                                <a href="{{ route('about') }}" class="gt-theme-btn style-2">
                                    <span class="gt-text-btn"><span class="gt-text-2">DISCOVER MORE <i class="fa-solid fa-arrow-right"></i></span></span>
                                </a>
                                <div class="call-info">
                                    <div class="icon"><i class="fa-solid fa-phone"></i></div>
                                    <h4><a href="tel:+441865123456">+44 1865 123456</a></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="gt-about-image">
                            <img src="{{ asset('template/oxford/assets/img/home-4/about/about-01.jpg') }}" alt="About Oxford School" class="wow img-custom-anim-right">
                            <div class="gt-about-image-2 wow img-custom-anim-left">
                                <img src="{{ asset('template/oxford/assets/img/home-4/about/about-02.jpg') }}" alt="Students">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Campus Life Section -->
    <section class="project-section-4 section-padding fix">
        <div class="container">
            <div class="gt-section-title-area">
                <div class="gt-section-title">
                    <h6 class="wow fadeInUp">CAMPUS LIFE &amp; FACILITIES</h6>
                    <h2>EXPLORE OUR CAMPUS</h2>
                </div>
                <div class="gt-array-button wow fadeInUp" data-wow-delay=".5s">
                    <button class="array-prev"><i class="fa-solid fa-arrow-left"></i></button>
                    <button class="array-next"><i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
        <div class="swiper project-slider-4">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <div class="project-card-items-4">
                        <div class="project-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/01.jpg') }}" alt="Science Labs">
                            <div class="project-content">
                                <span>Facilities</span>
                                <h3><a href="{{ route('about') }}">Advanced Chemistry &amp; Physics Labs</a></h3>
                            </div>
                            <a href="{{ route('about') }}" class="arrow-icon"><i class="fas fa-plus icon"></i></a>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="project-card-items-4">
                        <div class="project-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/02.jpg') }}" alt="Library">
                            <div class="project-content">
                                <span>Academics</span>
                                <h3><a href="{{ route('about') }}">Modern Multi-Resource Library</a></h3>
                            </div>
                            <a href="{{ route('about') }}" class="arrow-icon"><i class="fas fa-plus icon"></i></a>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="project-card-items-4">
                        <div class="project-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/03.jpg') }}" alt="Sports Complex">
                            <div class="project-content">
                                <span>Athletics</span>
                                <h3><a href="{{ route('about') }}">Championship Sports Complex</a></h3>
                            </div>
                            <a href="{{ route('about') }}" class="arrow-icon"><i class="fas fa-plus icon"></i></a>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="project-card-items-4">
                        <div class="project-thumb">
                            <img src="{{ asset('template/oxford/assets/img/home-4/project/04.jpg') }}" alt="Arts Center">
                            <div class="project-content">
                                <span>Creative Arts</span>
                                <h3><a href="{{ route('about') }}">Performing Arts &amp; Music Center</a></h3>
                            </div>
                            <a href="{{ route('about') }}" class="arrow-icon"><i class="fas fa-plus icon"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Video Section -->
    <div class="gt-video-section">
        <div class="gt-video-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/home-4/video-bg.jpg') }}');">
            <a href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I" class="video-btn video-popup ripple">PLAY</a>
        </div>
    </div>

    <!-- Leadership Team Section -->
    <section class="gt-team-section-4 fix section-padding">
        <div class="container">
            <div class="gt-section-title text-center">
                <h6 class="wow fadeInUp justify-content-center gt-style-4">OUR LEADERSHIP</h6>
                <h2 class="wow splt-txt" data-splitting="">MEET OUR DIRECTORS &amp; PRINCIPAL</h2>
            </div>
            <div class="row">
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                    <div class="gt-team-image-4">
                        <img src="{{ asset('template/oxford/assets/img/home-4/team/team-01.jpg') }}" alt="Principal">
                        <div class="gt-social-icon">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <div class="gt-team-content">
                            <div class="gt-team-title">
                                <h3><a href="{{ route('teachers') }}">Dr. Richard Sterling</a></h3>
                                <p>School Principal (PhD)</p>
                            </div>
                            <a href="{{ route('teachers') }}" class="arrow-icon"><i class="fa-regular fa-share-nodes"></i></a>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                    <div class="gt-team-image-4">
                        <img src="{{ asset('template/oxford/assets/img/home-4/team/team-02.jpg') }}" alt="Vice Principal">
                        <div class="gt-social-icon">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <div class="gt-team-content">
                            <div class="gt-team-title">
                                <h3><a href="{{ route('teachers') }}">Prof. Elizabeth Vance</a></h3>
                                <p>Vice Principal (MA)</p>
                            </div>
                            <a href="{{ route('teachers') }}" class="arrow-icon"><i class="fa-regular fa-share-nodes"></i></a>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                    <div class="gt-team-image-4">
                        <img src="{{ asset('template/oxford/assets/img/home-4/team/team-03.jpg') }}" alt="Dean of Admissions">
                        <div class="gt-social-icon">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <div class="gt-team-content">
                            <div class="gt-team-title">
                                <h3><a href="{{ route('teachers') }}">Mr. Arthur Pendelton</a></h3>
                                <p>Dean of Admissions</p>
                            </div>
                            <a href="{{ route('teachers') }}" class="arrow-icon"><i class="fa-regular fa-share-nodes"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section section-padding section-bg pt-0">
        <div class="container">
            <div class="gt-faq-wrapper pb-0">
                <div class="row g-4 align-items-center">
                    <div class="col-lg-6">
                        <div class="gt-faq-content">
                            <div class="gt-section-title mb-0">
                                <h6 class="wow fadeInUp gt-style-4">ASK QUESTIONS</h6>
                                <h2 class="wow splt-txt" data-splitting="">Frequently Asked Admissions Questions</h2>
                            </div>
                            <p class="gt-faq-text wow fadeInUp" data-wow-delay=".5s">Find direct answers to the most common queries asked by prospective parents and students looking to register at Oxford School.</p>
                            <div class="gt-faq-button justify-content-start wow fadeInUp" data-wow-delay=".7s">
                                <a href="{{ route('contact') }}" class="gt-theme-btn">
                                    <span class="gt-text-btn"><span class="gt-text-2">CONTACT US</span></span>
                                </a>
                                <a href="{{ route('course-details') }}" class="gt-theme-btn gt-border-style">
                                    <span class="gt-text-btn"><span class="gt-text-2">Admissions Process</span></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="faq-items mt-0 ms-0">
                            <div class="accordion" id="accordionHome">
                                <div class="accordion-item wow fadeInUp" data-wow-delay=".3s">
                                    <h2 class="accordion-header" id="headingOne">
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true">
                                            What is the general curriculum at Oxford School?
                                        </button>
                                    </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionHome">
                                        <div class="accordion-body"><p>We follow a highly competitive, balanced curriculum integrating the Cambridge International standards with comprehensive local guidelines. This prepares students for international examinations.</p></div>
                                    </div>
                                </div>
                                <div class="accordion-item wow fadeInUp" data-wow-delay=".5s">
                                    <h2 class="accordion-header" id="headingTwo">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false">
                                            What sports and arts activities are supported?
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionHome">
                                        <div class="accordion-body"><p>We provide premium facilities for soccer, basketball, swimming, robotics, classical music, drama production, and digital design.</p></div>
                                    </div>
                                </div>
                                <div class="accordion-item wow fadeInUp" data-wow-delay=".7s">
                                    <h2 class="accordion-header" id="headingThree">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false">
                                            What is the faculty-to-student ratio?
                                        </button>
                                    </h2>
                                    <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionHome">
                                        <div class="accordion-body"><p>Our average classroom size is limited to 20 students, maintaining a teacher-to-student ratio of approximately 1:12 for deep personalized guidance.</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- News Section -->
    <section class="gt-news-section fix section-padding">
        <div class="container">
            <div class="gt-section-title text-center">
                <h6 class="wow fadeInUp gt-style-4 justify-content-center">LATEST BLOG</h6>
                <h2 class="wow splt-txt" data-splitting="">OUR LATEST NEWS &amp; BLOG</h2>
            </div>
            <div class="row">
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                    <div class="gt-news-card-items style-2">
                        <div class="gt-news-image">
                            <img src="{{ asset('template/oxford/assets/img/home-4/news/news-01.jpg') }}" alt="News">
                        </div>
                        <div class="gt-news-content">
                            <h3><a href="{{ route('blog') }}">New Academic Session Begins with Record Enrolment</a></h3>
                            <ul class="gt-date-list">
                                <li><i class="fa-solid fa-calendar-days"></i> 11 January 2026</li>
                                <li><i class="fa-solid fa-comments"></i> 12 Comments</li>
                            </ul>
                        </div>
                        <a href="{{ route('blog') }}" class="gt-theme-btn"><span class="gt-text-btn"><span class="gt-text-2">READ MORE</span></span></a>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                    <div class="gt-news-card-items style-2">
                        <div class="gt-news-image">
                            <img src="{{ asset('template/oxford/assets/img/home-4/news/news-02.jpg') }}" alt="News">
                        </div>
                        <div class="gt-news-content">
                            <h3><a href="{{ route('blog') }}">Oxford Students Win Regional Science Olympiad</a></h3>
                            <ul class="gt-date-list">
                                <li><i class="fa-solid fa-calendar-days"></i> 03 February 2026</li>
                                <li><i class="fa-solid fa-comments"></i> 8 Comments</li>
                            </ul>
                        </div>
                        <a href="{{ route('blog') }}" class="gt-theme-btn"><span class="gt-text-btn"><span class="gt-text-2">READ MORE</span></span></a>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                    <div class="gt-news-card-items style-2">
                        <div class="gt-news-image">
                            <img src="{{ asset('template/oxford/assets/img/home-4/news/news-03.jpg') }}" alt="News">
                        </div>
                        <div class="gt-news-content">
                            <h3><a href="{{ route('blog') }}">Annual Prize Giving &amp; Cultural Day Ceremony</a></h3>
                            <ul class="gt-date-list">
                                <li><i class="fa-solid fa-calendar-days"></i> 20 March 2026</li>
                                <li><i class="fa-solid fa-comments"></i> 19 Comments</li>
                            </ul>
                        </div>
                        <a href="{{ route('blog') }}" class="gt-theme-btn"><span class="gt-text-btn"><span class="gt-text-2">READ MORE</span></span></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section-4">
        <div class="container">
            <div class="cta-contact-wrapper-4">
                <div class="shape"><img src="{{ asset('template/oxford/assets/img/home-4/cta-shape.png') }}" alt="shape"></div>
                <div class="cta-contact-left">
                    <div class="gt-section-title">
                        <h2 class="text-white wow fadeInUp" data-wow-delay=".3s">Admissions Open For<br>Academic Session 2026-27</h2>
                    </div>
                    <div class="icon-items mt-4 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                        <div class="content">
                            <p>Call Admissions Office</p>
                            <h5><a href="tel:+441865123456">+44 1865 123456</a></h5>
                        </div>
                    </div>
                </div>
                <div class="contact-image wow fadeInUp" data-wow-delay=".4s">
                    <img src="{{ asset('template/oxford/assets/img/home-4/cta.png') }}" alt="Oxford School Campus">
                </div>
            </div>
        </div>
    </section>

@endsection
