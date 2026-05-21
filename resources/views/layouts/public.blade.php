<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Oxford School - Inspiring Excellence, Nurturing Character">
    <title>@yield('title', 'Oxford School') - Oxford School</title>

    <link rel="shortcut icon" href="{{ asset('template/oxford/assets/img/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/animate.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/magnific-popup.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/meanmenu.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/swiper-bundle.min.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/splitting.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/nice-select.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/icomon.css') }}">
    <link rel="stylesheet" href="{{ asset('template/oxford/assets/css/main.css') }}">
    <style>
        .portal-dropdown .portal-dropdown-menu {
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            list-style: none;
            margin: 0;
            padding: 8px 0;
        }
        .portal-dropdown:hover .portal-dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .portal-dropdown-menu .dropdown-item {
            font-size: 14px;
            font-weight: 500;
            color: #333333 !important;
            transition: background-color 0.2s ease, color 0.2s ease;
            text-align: left;
            text-decoration: none;
        }
        .portal-dropdown-menu .dropdown-item:hover {
            background-color: #0A2240 !important;
            color: #ffffff !important;
        }
        .portal-dropdown-menu .dropdown-item:hover i {
            color: #ffffff !important;
        }
        .portal-dropdown-menu .border-top {
            border-top: 1px solid #eeeeee !important;
        }
    </style>
</head>
<body>

<div class="page-wrapper">

    <!-- Preloader Start -->
    <div id="preloader" class="preloader">
        <div class="animation-preloader">
            <div class="spinner"></div>
            <div class="txt-loading">
                <span data-text-preloader="O" class="letters-loading">O</span>
                <span data-text-preloader="X" class="letters-loading">X</span>
                <span data-text-preloader="F" class="letters-loading">F</span>
                <span data-text-preloader="O" class="letters-loading">O</span>
                <span data-text-preloader="R" class="letters-loading">R</span>
                <span data-text-preloader="D" class="letters-loading">D</span>
            </div>
            <p class="text-center">Loading</p>
        </div>
        <div class="loader">
            <div class="row">
                <div class="col-3 loader-section section-left"><div class="bg"></div></div>
                <div class="col-3 loader-section section-left"><div class="bg"></div></div>
                <div class="col-3 loader-section section-right"><div class="bg"></div></div>
                <div class="col-3 loader-section section-right"><div class="bg"></div></div>
            </div>
        </div>
    </div>

    <!-- Back To Top -->
    <button id="gt-back-top" class="gt-back-to-top show">
        <i class="fa-solid fa-arrow-up"></i>
    </button>

    <!-- Mouse Cursor -->
    <div class="mouseCursor cursor-outer"></div>
    <div class="mouseCursor cursor-inner"></div>

    <!-- Offcanvas Area -->
    <div class="fix-area">
        <div class="offcanvas__info">
            <div class="offcanvas__wrapper">
                <div class="offcanvas__content">
                    <div class="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                        <div class="offcanvas__logo">
                            <a href="{{ route('home') }}">
                                <img src="{{ asset('template/oxford/assets/img/logo/oxford-logo-black.svg') }}" alt="Oxford School Logo">
                            </a>
                        </div>
                        <div class="offcanvas__close">
                            <button><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <p class="text d-none d-xl-block">
                        Oxford School is committed to providing a top-tier learning environment that empowers every student to excel academically and personally.
                    </p>
                    <div class="mobile-menu fix mb-3"></div>
                    <div class="offcanvas__contact">
                        <h4>Contact Info</h4>
                        <ul>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon"><i class="fal fa-map-marker-alt"></i></div>
                                <div class="offcanvas__contact-text"><a target="_blank" href="#">12 University Ave, Oxford, OX1 2JD, United Kingdom</a></div>
                            </li>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon mr-15"><i class="fal fa-envelope"></i></div>
                                <div class="offcanvas__contact-text"><a href="mailto:info@oxfordschool.edu">info@oxfordschool.edu</a></div>
                            </li>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon mr-15"><i class="fal fa-clock"></i></div>
                                <div class="offcanvas__contact-text"><a target="_blank" href="#">Monday - Friday, 08:00 AM - 04:00 PM</a></div>
                            </li>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon mr-15"><i class="far fa-phone"></i></div>
                                <div class="offcanvas__contact-text"><a href="tel:+441865123456">+44 1865 123456</a></div>
                            </li>
                        </ul>
                        <div class="header-button mt-4">
                            <a href="{{ route('login') }}" class="gt-theme-btn">
                                <span class="gt-text-btn"><span class="gt-text-2">Portal <i class="fa-solid fa-arrow-right"></i></span></span>
                            </a>
                        </div>
                        <div class="social-icon d-flex align-items-center mt-3">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-youtube"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas__overlay"></div>

    <!-- Header -->
    <header id="header-sticky" class="header-1 header-5">
        <div class="container-fluid">
            <div class="mega-menu-wrapper">
                <div class="header-main">
                    <div class="logo">
                        <a href="{{ route('home') }}" class="header-logo-2">
                            <img src="{{ asset('template/oxford/assets/img/logo/oxford-logo-black.svg') }}" alt="Oxford School Logo">
                        </a>
                        <a href="{{ route('home') }}" class="header-logo">
                            <img src="{{ asset('template/oxford/assets/img/logo/oxford-logo-white.svg') }}" alt="Oxford School Logo">
                        </a>
                    </div>
                    <div class="mean__menu-wrapper">
                        <div class="main-menu">
                            <nav id="mobile-menu">
                                <ul>
                                    <li class="{{ request()->routeIs('home') ? 'active' : '' }}">
                                        <a href="{{ route('home') }}">Home</a>
                                    </li>
                                    <li class="{{ request()->routeIs('about') ? 'active' : '' }}">
                                        <a href="{{ route('about') }}">About Us</a>
                                    </li>
                                    <li class="{{ request()->routeIs('services') ? 'active' : '' }}">
                                        <a href="{{ route('services') }}">Academics</a>
                                    </li>
                                    <li class="{{ request()->routeIs('course-details') ? 'active' : '' }}">
                                        <a href="{{ route('course-details') }}">Admissions</a>
                                    </li>
                                    <li class="{{ request()->routeIs('teachers') ? 'active' : '' }}">
                                        <a href="{{ route('teachers') }}">Our Faculty</a>
                                    </li>
                                    <li class="{{ request()->routeIs('blog') ? 'active' : '' }}">
                                        <a href="{{ route('blog') }}">News &amp; Events</a>
                                    </li>
                                    <li class="{{ request()->routeIs('contact') ? 'active' : '' }}">
                                        <a href="{{ route('contact') }}">Contact Us</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div class="header-right d-flex justify-content-end align-items-center">
                        <div class="header__hamburger my-auto">
                            <div class="sidebar__toggle">
                                <div class="header-bar">
                                    <i class="fa-solid fa-bars" style="font-size: 20px; color: var(--gt-header); cursor: pointer;"></i>
                                </div>
                            </div>
                        </div>
                        <div class="portal-dropdown position-relative d-none d-lg-inline-block me-2">
                            <button class="gt-theme-btn">
                                <span class="gt-text-btn">
                                    <span class="gt-text-2">Portal <i class="fa-solid fa-chevron-down ms-1" style="font-size: 11px;"></i></span>
                                </span>
                            </button>
                            <ul class="portal-dropdown-menu position-absolute end-0 bg-white border rounded shadow-lg py-2" style="min-width: 185px; z-index: 1000; margin-top: 5px;">
                                <li>
                                    <a href="{{ route('login') }}" class="dropdown-item px-3 py-2 text-dark d-block">
                                        <i class="fa-solid fa-sign-in-alt text-primary me-2"></i> Portal Login
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('result-checker.index') }}" class="dropdown-item px-3 py-2 text-dark d-block border-top">
                                        <i class="fa-solid fa-graduation-cap text-primary me-2"></i> Check Result
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Search Popup -->
    <div class="search-popup">
        <div class="search-popup__overlay search-toggler"></div>
        <div class="search-popup__content">
            <form role="search" method="get" class="search-popup__form" action="#">
                <input type="text" id="search" name="search" placeholder="Search Here...">
                <button type="submit" aria-label="search submit" class="search-btn">
                    <span><i class="fa-regular fa-magnifying-glass"></i></span>
                </button>
            </form>
        </div>
    </div>

    @yield('content')

    <!-- Footer -->
    <footer class="gt-footer-section footer-bg">
        <div class="container">
            <div class="gt-footer-widget-wrapper">
                <div class="row justify-content-between">
                    <div class="col-xl-5 col-lg-6 col-md-12 wow fadeInUp" data-wow-delay=".2s">
                        <div class="gt-footer-widget-items">
                            <div class="gt-widget-head">
                                <a href="{{ route('home') }}" class="gt-footer-logo">
                                    <img src="{{ asset('template/oxford/assets/img/logo/oxford-logo-white.svg') }}" alt="Oxford School">
                                </a>
                            </div>
                            <div class="gt-footer-content">
                                <p>Oxford School is committed to delivering academic excellence and holistic education. We inspire students to become ethical leaders, critical thinkers, and lifelong learners.</p>
                                <ul class="gt-contact-list">
                                    <li>
                                        <div class="icon">
                                            <img src="{{ asset('template/oxford/assets/img/call.png') }}" alt="phone">
                                            <span>Phone</span>
                                        </div>
                                        <a href="tel:+441865123456">+44 1865 123456</a>
                                    </li>
                                    <li>
                                        <div class="icon">
                                            <img src="{{ asset('template/oxford/assets/img/location.png') }}" alt="location">
                                            <span>Location</span>
                                        </div>
                                        12 University Ave, Oxford, OX1 2JD, UK
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-3 col-md-6 col-sm-6 wow fadeInUp" data-wow-delay=".4s">
                        <div class="gt-footer-widget-items">
                            <div class="gt-widget-head"><h3>Useful Links</h3></div>
                            <ul class="gt-list-area">
                                <li><a href="{{ route('about') }}">About Us</a></li>
                                <li><a href="{{ route('services') }}">Academic Programs</a></li>
                                <li><a href="{{ route('course-details') }}">Admissions</a></li>
                                <li><a href="{{ route('teachers') }}">Our Faculty</a></li>
                                <li><a href="{{ route('contact') }}">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-2 ps-lg-3 col-lg-3 col-md-6 col-sm-6 wow fadeInUp" data-wow-delay=".6s">
                        <div class="gt-footer-widget-items">
                            <div class="gt-widget-head"><h3>Our Programs</h3></div>
                            <ul class="gt-list-area">
                                <li><a href="{{ route('services') }}">Primary Education</a></li>
                                <li><a href="{{ route('services') }}">Secondary School</a></li>
                                <li><a href="{{ route('services') }}">High School</a></li>
                                <li><a href="{{ route('services') }}">Advanced Placements</a></li>
                                <li><a href="{{ route('services') }}">Extracurriculars</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6 col-sm-6 wow fadeInUp" data-wow-delay=".8s">
                        <div class="gt-footer-widget-items">
                            <div class="gt-widget-head"><h3>Our Contact</h3></div>
                            <ul class="gt-contact-content">
                                <li>
                                    <span><i class="fa-solid fa-location-dot"></i></span>
                                    12 University Ave, Oxford, OX1 2JD, UK
                                </li>
                                <li>
                                    <span><i class="fa-solid fa-phone"></i></span>
                                    <a href="tel:+441865123456">+44 1865 123456</a>
                                </li>
                                <li>
                                    <span><i class="fa-solid fa-envelope"></i></span>
                                    <a href="mailto:info@oxfordschool.edu">info@oxfordschool.edu</a>
                                </li>
                            </ul>
                            <div class="footer-socials">
                                <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                                <a href="#"><i class="fa-brands fa-instagram"></i></a>
                                <a href="#"><i class="fa-brands fa-twitter"></i></a>
                                <a href="#"><i class="fa-brands fa-youtube"></i></a>
                            </div>
                            <div class="mt-3">
                                <a href="{{ route('result-checker.index') }}" class="gt-theme-btn" style="display:inline-flex;">
                                    <span class="gt-text-btn"><span class="gt-text-2">Check Result <i class="fa-solid fa-arrow-right"></i></span></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-wrapper">
                    <p>© {{ date('Y') }} <b>Oxford School</b>. All Rights Reserved.</p>
                    <div class="gt-social-icon d-flex align-items-center wow fadeInUp" data-wow-delay=".5s">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

</div><!-- /.page-wrapper -->

<!-- Scripts -->
<script src="{{ asset('template/oxford/assets/js/jquery-3.7.1.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/jquery.nice-select.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/jquery.waypoints.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/jquery.counterup.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/swiper-bundle.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/jquery.meanmenu.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/jquery.magnific-popup.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/splitting.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/wow.min.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/splitting-animation.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/template-settings.js') }}"></script>
<script src="{{ asset('template/oxford/assets/js/main.js') }}"></script>

@stack('scripts')
</body>
</html>
