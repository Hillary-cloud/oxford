@extends('layouts.public')

@section('title', 'News Details')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">NEWS DETAILS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li><a href="{{ route('blog') }}">School News</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Details</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- News Standard Section -->
    <section class="news-standard-section section-padding">
        <div class="container">
            <div class="gt-news-standard-wrapper">
                <div class="row g-4">
                    <div class="col-12 col-lg-8">
                        <div class="blog-details-area">
                            <div class="gt-blog-details-items">
                                <div class="gt-blog-image">
                                    <img src="{{ asset('template/oxford/assets/img/home-4/news/news-01.jpg') }}" alt="News">
                                </div>
                                <div class="gt-blog-content mt-4">
                                    <ul class="gt-date-list mb-3">
                                        <li><i class="fa-solid fa-calendar-days"></i> 11 March 2026</li>
                                        <li><i class="fa-solid fa-comments"></i> 5 Comments</li>
                                    </ul>
                                    <h2>New Academic Session Begins with Record Enrolment</h2>
                                    <p class="mt-3">Oxford School officially welcomed both new and returning students to the first term of the 2026 academic year. With state-of-the-art facilities added over the holidays, our enrollment numbers have reached record levels. We are extremely pleased to start this semester with outstanding potential, exceptional additions to our staff, and newly optimized learning resources across all classes.</p>
                                    <p>We are focusing heavily on early science and robotics this session, alongside our traditional excellence in visual arts and mathematical foundations. The school administration has also introduced optimized student portal features to make result checking and fee payments seamless for parents and guardians alike.</p>
                                    
                                    <blockquote class="my-4 p-4 bg-light border-start border-primary border-4" style="font-style: italic;">
                                        "Our goal remains centered on providing a standard of holistic instruction that builds ethical leaders and high-achievers. The upcoming session promises to be one of our most academically productive years yet."
                                        <cite class="d-block mt-2 font-weight-bold text-dark">— Dr. Richard Sterling, Principal</cite>
                                    </blockquote>

                                    <p>As we navigate this new academic year, we encourage parents to stay actively engaged with the classroom updates and take advantage of our newly launched student portal systems.</p>
                                </div>

                                <div class="post-tags my-4">
                                    <span class="font-weight-bold text-dark me-2">Tags:</span>
                                    <a href="#" class="badge bg-light text-dark px-3 py-2 border me-2">Admissions</a>
                                    <a href="#" class="badge bg-light text-dark px-3 py-2 border me-2">Education</a>
                                    <a href="#" class="badge bg-light text-dark px-3 py-2 border">School Life</a>
                                </div>

                                <!-- Comments Area -->
                                <div class="comments-area mt-5">
                                    <h4 class="mb-4">Comments (2)</h4>
                                    <div class="comment-list">
                                        <div class="d-flex mb-4 p-3 bg-light rounded">
                                            <div class="me-3">
                                                <i class="fa-solid fa-user-circle text-muted" style="font-size: 48px;"></i>
                                            </div>
                                            <div>
                                                <h5 class="mb-1 text-dark">Jonathan Doe <small class="text-muted ms-2">12 March 2026</small></h5>
                                                <p class="mb-0">This is absolutely fantastic news! Excited for the new academic session and looking forward to the robotics workshops.</p>
                                            </div>
                                        </div>
                                        <div class="d-flex mb-4 p-3 bg-light rounded ms-5">
                                            <div class="me-3">
                                                <i class="fa-solid fa-user-circle text-muted" style="font-size: 48px;"></i>
                                            </div>
                                            <div>
                                                <h5 class="mb-1 text-dark">Sarah Smith <small class="text-muted ms-2">13 March 2026</small></h5>
                                                <p class="mb-0">The new portal upgrades are a lifesaver. Checking result sheets and making term payments is incredibly easy now.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Leave Comment Form -->
                                <div class="comments-form mt-5">
                                    <h4 class="mb-3">Leave a Comment</h4>
                                    <form action="#" class="contact-comments">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <input type="text" class="form-control" placeholder="Name*">
                                            </div>
                                            <div class="col-md-6">
                                                <input type="email" class="form-control" placeholder="Email*">
                                            </div>
                                            <div class="col-12">
                                                <textarea class="form-control" rows="5" placeholder="Your Comment*"></textarea>
                                            </div>
                                            <div class="col-12">
                                                <button type="submit" class="gt-theme-btn">
                                                    <span class="gt-text-btn"><span class="gt-text-2">Post Comment</span></span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
