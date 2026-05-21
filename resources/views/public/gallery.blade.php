@extends('layouts.public')

@section('title', 'Gallery')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">OXFORD GALLERY</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Gallery</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Gallery Section -->
    <section class="gallery-section section-padding">
        <div class="container">
            <div class="row g-4">
                @php
                $images = [
                    ['img' => 'home-4/about/about-01.jpg', 'title' => 'Main Campus Building'],
                    ['img' => 'home-4/about/about-02.jpg', 'title' => 'Student Laboratory'],
                    ['img' => 'home-4/news/news-01.jpg', 'title' => 'Science Olympiad Ceremony'],
                    ['img' => 'home-4/news/news-02.jpg', 'title' => 'Green Initiative Event'],
                    ['img' => 'home-4/news/news-03.jpg', 'title' => 'Graduation & Awards Night'],
                    ['img' => 'home-4/team/team-01.jpg', 'title' => 'Faculty Assembly Meeting'],
                    ['img' => 'home-4/team/team-02.jpg', 'title' => 'Student Mentorship Class'],
                    ['img' => 'home-4/team/team-03.jpg', 'title' => 'Robotics Club Session'],
                ];
                @endphp

                @foreach($images as $image)
                <div class="col-lg-3 col-md-6 col-sm-12 wow fadeInUp" data-wow-delay=".2s">
                    <div class="gallery-card position-relative overflow-hidden rounded border shadow-sm" style="height: 250px;">
                        <img src="{{ asset('template/oxford/assets/img/'.$image['img']) }}" alt="{{ $image['title'] }}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                        <div class="gallery-overlay position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-3 text-center" style="opacity: 0; transition: opacity 0.3s ease;">
                            <h5 class="mb-0 text-white">{{ $image['title'] }}</h5>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- Custom CSS for Hover Effect -->
    <style>
        .gallery-card:hover img {
            transform: scale(1.1);
        }
        .gallery-card:hover .gallery-overlay {
            opacity: 1 !important;
        }
    </style>

@endsection
