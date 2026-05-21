@extends('layouts.public')

@section('title', 'Pricing Tables')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">PRICING TABLES</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Pricing</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Pricing Area -->
    <section class="pricing-section section-padding section-bg">
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                    <div class="p-5 bg-white text-center rounded border shadow-sm h-100 d-flex flex-column justify-content-between">
                        <div>
                            <span class="badge bg-light text-primary mb-3 px-3 py-2 border">ELEMENTARY</span>
                            <h2 class="text-dark mb-4">$290<small class="text-muted" style="font-size: 16px;"> / Term</small></h2>
                            <ul class="list-unstyled mb-5 text-muted text-start border-top pt-4">
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Standard Classroom Access</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> All Core Curriculum Books</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Arts &amp; Crafts Material</li>
                                <li class="text-decoration-line-through"><i class="fa-solid fa-times-circle text-danger me-2"></i> Robotics lab access</li>
                            </ul>
                        </div>
                        <a href="{{ route('contact') }}" class="gt-theme-btn style-2 w-100">
                            <span class="gt-text-btn"><span class="gt-text-2">ENROLL NOW</span></span>
                        </a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                    <div class="p-5 bg-white text-center rounded border border-primary border-2 shadow h-100 d-flex flex-column justify-content-between position-relative">
                        <span class="position-absolute top-0 start-50 translate-middle badge bg-primary px-3 py-2">POPULAR</span>
                        <div>
                            <span class="badge bg-light text-primary mb-3 px-3 py-2 border mt-2">SECONDARY</span>
                            <h2 class="text-dark mb-4">$390<small class="text-muted" style="font-size: 16px;"> / Term</small></h2>
                            <ul class="list-unstyled mb-5 text-muted text-start border-top pt-4">
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Standard Classroom Access</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Core Curriculum Textbooks</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Coding &amp; Science Labs</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Outdoor Sports Coaching</li>
                            </ul>
                        </div>
                        <a href="{{ route('contact') }}" class="gt-theme-btn w-100">
                            <span class="gt-text-btn"><span class="gt-text-2">ENROLL NOW</span></span>
                        </a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                    <div class="p-5 bg-white text-center rounded border shadow-sm h-100 d-flex flex-column justify-content-between">
                        <div>
                            <span class="badge bg-light text-primary mb-3 px-3 py-2 border">ADVANCED (AP)</span>
                            <h2 class="text-dark mb-4">$590<small class="text-muted" style="font-size: 16px;"> / Term</small></h2>
                            <ul class="list-unstyled mb-5 text-muted text-start border-top pt-4">
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> High School Honors Access</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Full Library &amp; Resource Guide</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> Complete Robotics Lab</li>
                                <li class="mb-3"><i class="fa-solid fa-check-circle text-primary me-2"></i> University Placement Mentorship</li>
                            </ul>
                        </div>
                        <a href="{{ route('contact') }}" class="gt-theme-btn style-2 w-100">
                            <span class="gt-text-btn"><span class="gt-text-2">ENROLL NOW</span></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
