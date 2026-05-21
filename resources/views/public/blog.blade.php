@extends('layouts.public')

@section('title', 'News & Events')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">OXFORD NEWS &amp; BLOG</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>School News</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- News Section -->
    <section class="news-standard-section section-padding">
        <div class="container">
            <div class="gt-news-standard-wrapper">
                <div class="row g-4">
                    <div class="col-12 col-lg-8">
                        <div class="gt-news-standard-items">
                            @php
                            $blogs = [
                                [
                                    'title' => 'New Academic Session Begins with Record Enrolment',
                                    'date' => '11 January 2026',
                                    'comments' => '12 Comments',
                                    'img' => 'news-01.jpg',
                                    'desc' => 'Oxford School officially welcomed both new and returning students to the first term of the 2026 academic year. With state-of-the-art facilities added over the holidays, our enrollment numbers have reached record levels.'
                                ],
                                [
                                    'title' => 'Oxford Students Win Regional Science Olympiad',
                                    'date' => '03 February 2026',
                                    'comments' => '8 Comments',
                                    'img' => 'news-02.jpg',
                                    'desc' => 'Our exceptional Science and STEM department students showcased their brilliant project proposals and critical skills, clinching the overall first place at this year’s regional Olympiad.'
                                ],
                                [
                                    'title' => 'Annual Prize Giving & Cultural Day Ceremony',
                                    'date' => '20 March 2026',
                                    'comments' => '19 Comments',
                                    'img' => 'news-03.jpg',
                                    'desc' => 'Celebrating the diverse background and achievements of our student base, Oxford School successfully held its annual awards night and multi-cultural exhibition day.'
                                ]
                            ];
                            @endphp

                            @foreach($blogs as $blog)
                            <div class="gt-news-card-items-4">
                                <div class="gt-news-image">
                                    <img src="{{ asset('template/oxford/assets/img/home-4/news/'.$blog['img']) }}" alt="{{ $blog['title'] }}">
                                </div>
                                <div class="gt-news-content">
                                    <ul class="gt-date-list">
                                        <li><i class="fa-solid fa-calendar-days"></i> {{ $blog['date'] }}</li>
                                        <li><i class="fa-solid fa-comments"></i> {{ $blog['comments'] }}</li>
                                    </ul>
                                    <h3><a href="{{ route('blog-single') }}">{{ $blog['title'] }}</a></h3>
                                    <p>{{ $blog['desc'] }}</p>
                                    <a href="{{ route('blog-single') }}" class="gt-link-btn">
                                        <i class="fa-solid fa-chevrons-right"></i> Read More
                                    </a>
                                </div>
                            </div>
                            @endforeach

                            <div class="page-nav-wrap">
                                <ul>
                                    <li><a class="page-numbers" href="#"><i class="fa-solid fa-chevrons-left"></i></a></li>
                                    <li class="active"><a class="page-numbers" href="#">01</a></li>
                                    <li><a class="page-numbers" href="#">02</a></li>
                                    <li><a class="page-numbers" href="#">03</a></li>
                                    <li><a class="page-numbers" href="#"><i class="fa-solid fa-chevrons-right"></i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-12">
                        <div class="gt-main-sideber sticky-style">
                            <div class="gt-single-sideber-widget">
                                <div class="gt-widget-title">
                                    <h3>Categories</h3>
                                </div>
                                <ul>
                                    <li><a href="{{ route('blog') }}">Admissions</a><span><i class="fa-solid fa-chevrons-right"></i></span></li>
                                    <li><a href="{{ route('blog') }}">Academics</a><span><i class="fa-solid fa-chevrons-right"></i></span></li>
                                    <li><a href="{{ route('blog') }}">Sports Events</a><span><i class="fa-solid fa-chevrons-right"></i></span></li>
                                    <li><a href="{{ route('blog') }}">Art &amp; Culture</a><span><i class="fa-solid fa-chevrons-right"></i></span></li>
                                    <li><a href="{{ route('blog') }}">Student Life</a><span><i class="fa-solid fa-chevrons-right"></i></span></li>
                                </ul>
                            </div>
                            <div class="gt-single-sideber-widget">
                                <div class="gt-widget-title">
                                    <h3>Recent Posts</h3>
                                </div>
                                <div class="gt-recent-post-area">
                                    <div class="gt-recent-items">
                                        <div class="gt-recent-thumb">
                                            <img src="{{ asset('template/oxford/assets/img/home-4/news/news-01.jpg') }}" alt="News">
                                        </div>
                                        <div class="gt-recent-content">
                                            <h5><a href="{{ route('blog-single') }}">Oxford School National Debate Championship Triumphs</a></h5>
                                            <ul>
                                                <li>September 26, 2025</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="gt-recent-items">
                                        <div class="gt-recent-thumb">
                                            <img src="{{ asset('template/oxford/assets/img/home-4/news/news-02.jpg') }}" alt="News">
                                        </div>
                                        <div class="gt-recent-content">
                                            <h5><a href="{{ route('blog-single') }}">Growth Mindset Philosophy for Young Learners</a></h5>
                                            <ul>
                                                <li>September 26, 2025</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
