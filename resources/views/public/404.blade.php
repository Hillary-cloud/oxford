@extends('layouts.public')

@section('title', 'Page Not Found')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ERROR 404</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>404</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Error Area -->
    <section class="error-section section-padding text-center">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <h1 class="display-1 text-primary font-weight-bold" style="font-size: 150px; line-height: 1;">404</h1>
                    <h2 class="text-dark mb-3">SORRY, PAGE NOT FOUND!</h2>
                    <p class="text-muted mb-5">The page you are looking for is not available or has been moved. Use the navigation buttons below to return safely to the home page or contact our school support.</p>
                    <div class="d-flex justify-content-center">
                        <a href="{{ route('home') }}" class="gt-theme-btn me-3">
                            <span class="gt-text-btn"><span class="gt-text-2">BACK TO HOME</span></span>
                        </a>
                        <a href="{{ route('contact') }}" class="gt-theme-btn style-2">
                            <span class="gt-text-btn"><span class="gt-text-2">CONTACT US</span></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
