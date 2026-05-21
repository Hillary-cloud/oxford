@extends('layouts.public')

@section('title', 'Faculty Details')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">FACULTY BIO</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li><a href="{{ route('teachers') }}">Our Faculty</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Bio</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Teacher Bio -->
    <section class="teacher-bio-section section-padding">
        <div class="container">
            <div class="row g-5">
                <div class="col-lg-5">
                    <div class="teacher-profile-card p-4 bg-light rounded text-center border">
                        <img src="{{ asset('template/oxford/assets/img/home-4/team/team-01.jpg') }}" alt="Principal" class="img-fluid rounded mb-3" style="max-height: 400px; width: 100%; object-fit: cover;">
                        <h3 class="mb-1 text-dark">Dr. Richard Sterling</h3>
                        <p class="text-primary font-weight-bold mb-3">School Principal (PhD)</p>
                        <div class="social-links d-flex justify-content-center">
                            <a href="#" class="btn btn-outline-secondary btn-sm mx-1"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="btn btn-outline-secondary btn-sm mx-1"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="btn btn-outline-secondary btn-sm mx-1"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="teacher-details-content">
                        <h2 class="mb-4">Dr. Richard Sterling</h2>
                        <p class="lead">Dr. Richard Sterling brings over twenty years of experienced leadership in progressive, holistic school settings. With a PhD in Educational Leadership, he focuses heavily on building critical reasoning capabilities and standard scientific curiosity within young scholars.</p>
                        <p>Under his administration, Oxford School has developed its signature STEM lab upgrades, expanded early-stage coding curricula, and earned regional recognition for science Olympiad triumphs. He believes in creating a nurturing environment where ethical character is prioritized just as highly as academic achievements.</p>
                        
                        <div class="row mt-5 g-4">
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded border h-100">
                                    <h5 class="text-dark"><i class="fa-solid fa-graduation-cap text-primary me-2"></i> Education</h5>
                                    <p class="mb-0 small">PhD in Educational Leadership — Oxford University</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded border h-100">
                                    <h5 class="text-dark"><i class="fa-solid fa-envelope text-primary me-2"></i> Contact</h5>
                                    <p class="mb-0 small">r.sterling@oxfordschool.edu</p>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Contact Form -->
                        <div class="quick-contact-box mt-5 p-4 bg-light rounded border">
                            <h4 class="mb-3 text-dark">Quick Enquiry</h4>
                            <form action="#" class="row g-3">
                                <div class="col-md-6">
                                    <input type="text" class="form-control" placeholder="Your Name">
                                </div>
                                <div class="col-md-6">
                                    <input type="email" class="form-control" placeholder="Your Email">
                                </div>
                                <div class="col-12">
                                    <textarea class="form-control" rows="3" placeholder="Message Details"></textarea>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="gt-theme-btn">
                                        <span class="gt-text-btn"><span class="gt-text-2">Send Message <i class="fa-solid fa-paper-plane"></i></span></span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
