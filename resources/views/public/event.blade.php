@extends('layouts.public')

@section('title', 'Upcoming Events')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">SCHOOL EVENTS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Events</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Events Section -->
    <section class="events-section section-padding">
        <div class="container">
            <div class="row g-4">
                @php
                $events = [
                    [
                        'title' => 'Annual STEM & Science Fair 2026',
                        'date' => '15 March 2026',
                        'time' => '09:00 AM - 03:00 PM',
                        'loc' => 'Oxford Science Pavilion',
                        'img' => 'news-01.jpg',
                        'desc' => 'Explore creative experiments, software designs, and robotics builds created wholly by our elementary and high school students.'
                    ],
                    [
                        'title' => 'Inter-School Athletics Championship',
                        'date' => '02 April 2026',
                        'time' => '08:00 AM - 04:00 PM',
                        'loc' => 'Oxford Sports Complex',
                        'img' => 'news-02.jpg',
                        'desc' => 'Our athletic division hosts the annual track and field tournament welcoming guest scholars from across the region.'
                    ],
                    [
                        'title' => 'Performing Arts & Music Concert',
                        'date' => '18 May 2026',
                        'time' => '06:00 PM - 09:00 PM',
                        'loc' => 'Main Auditorium',
                        'img' => 'news-03.jpg',
                        'desc' => 'Join us for a spectacular night of classical music, theatre performances, and beautiful visual art displays.'
                    ],
                ];
                @endphp

                @foreach($events as $event)
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                    <div class="card h-100 border rounded shadow-sm overflow-hidden">
                        <img src="{{ asset('template/oxford/assets/img/home-4/news/'.$event['img']) }}" class="card-img-top" alt="{{ $event['title'] }}" style="height: 220px; object-fit: cover;">
                        <div class="card-body p-4">
                            <span class="badge bg-primary mb-2">{{ $event['date'] }}</span>
                            <h4 class="card-title text-dark mb-3">{{ $event['title'] }}</h4>
                            <p class="card-text text-muted mb-4">{{ $event['desc'] }}</p>
                            <ul class="list-unstyled mb-0 border-top pt-3 small text-muted">
                                <li class="mb-2"><i class="fa-solid fa-clock text-primary me-2"></i> {{ $event['time'] }}</li>
                                <li><i class="fa-solid fa-map-marker-alt text-primary me-2"></i> {{ $event['loc'] }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </section>

@endsection
