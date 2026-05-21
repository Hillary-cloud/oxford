@extends('layouts.public')

@section('title', 'Contact Us')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">CONTACT US</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>Contact Us</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Contact Info Cards -->
    <section class="gt-contact-section section-padding fix pb-0">
        <div class="container">
            <div class="row g-4">
                <div class="col-xl-4 col-lg-4 col-md-6">
                    <div class="contact-info-items">
                        <div class="icon"><i class="fa-solid fa-square-chevron-down"></i></div>
                        <div class="content">
                            <h4>Email Address</h4>
                            <h6>
                                <a href="mailto:info@oxfordschool.edu">info@oxfordschool.edu</a><br>
                                <a href="mailto:admissions@oxfordschool.edu">admissions@oxfordschool.edu</a>
                            </h6>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6">
                    <div class="contact-info-items">
                        <div class="icon"><i class="fa-solid fa-location-dot"></i></div>
                        <div class="content">
                            <h4>Our Address</h4>
                            <h6>12 University Ave, Oxford,<br>OX1 2JD, United Kingdom</h6>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6">
                    <div class="contact-info-items">
                        <div class="icon"><i class="fa-solid fa-phone"></i></div>
                        <div class="content">
                            <h4>Phone Number</h4>
                            <h6>
                                <a href="tel:+441865123456">+44 1865 123456</a><br>
                                <a href="tel:+441865123457">+44 1865 123457</a>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Form -->
    <section class="gt-contact-us-section section-padding pb-0 fix">
        <div class="container">
            <div class="gt-contact-us-wrapper">
                <h2>Send Admissions Enquiry</h2>
                <form action="#" id="contact-form" method="POST">
                    @csrf
                    <div class="row g-4">
                        <div class="col-lg-6">
                            <div class="form-clt">
                                <span>Your Name</span>
                                <input type="text" name="name" id="contact-name" placeholder="Full Name*">
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="form-clt">
                                <span>Your Email</span>
                                <input type="email" name="email" id="contact-email" placeholder="Your Email*">
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="form-clt">
                                <span>Phone Number</span>
                                <input type="text" name="phone" id="contact-phone" placeholder="Your Phone Number">
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="form-clt">
                                <span>Subject</span>
                                <input type="text" name="subject" id="contact-subject" placeholder="Subject*">
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="form-clt">
                                <span>Your Message</span>
                                <textarea name="message" id="contact-message" placeholder="Message Here*"></textarea>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="contact-btn">
                                <button type="submit" class="gt-theme-btn">
                                    <span class="gt-text-btn"><span class="gt-text-2">SEND MESSAGE <i class="fa-solid fa-chevrons-right"></i></span></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- Map -->
    <div class="gt-map-section">
        <div class="gt-map-items">
            <div class="googpemap">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2469.6506971297395!2d-1.2637!3d51.7520!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876c6a9f0e3b1a9%3A0x6de87b6f5e2de52b!2sOxford%20University!5e0!3m2!1sen!2suk!4v1641984054261!5m2!1sen!2suk" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>
    </div>

@endsection
