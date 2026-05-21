@extends('layouts.public')

@section('title', 'FAQ')

@section('content')

    <!-- Breadcrumb -->
    <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('template/oxford/assets/img/breadcrumb-bg.jpg') }}');">
        <div class="container">
            <div class="gt-page-heading">
                <div class="gt-breadcrumb-sub-title">
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">FREQUENTLY ASKED QUESTIONS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li><a href="{{ route('home') }}">Home</a></li>
                    <li><i class="fa-solid fa-chevron-right"></i></li>
                    <li>FAQ</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- FAQ Section -->
    <section class="faq-section section-padding section-bg">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="faq-items mt-0">
                        <div class="accordion" id="faqAccordionPage">
                            <div class="accordion-item wow fadeInUp" data-wow-delay=".2s">
                                <h2 class="accordion-header" id="faqOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaqOne" aria-expanded="true">
                                        What curriculum does Oxford School follow?
                                    </button>
                                </h2>
                                <div id="collapseFaqOne" class="accordion-collapse collapse show" data-bs-parent="#faqAccordionPage">
                                    <div class="accordion-body">
                                        <p>Oxford School integrates the Cambridge International curriculum standards with localized regional requirements. We ensure all students have access to top-tier coursework in sciences, mathematics, literature, and advanced technologies like robotics and programming.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item wow fadeInUp" data-wow-delay=".3s">
                                <h2 class="accordion-header" id="faqTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaqTwo" aria-expanded="false">
                                        How do we access the Student Portal for result checking?
                                    </button>
                                </h2>
                                <div id="collapseFaqTwo" class="accordion-collapse collapse" data-bs-parent="#faqAccordionPage">
                                    <div class="accordion-body">
                                        <p>Parents and students can click on the "Portal Login" or "Check Result" button at the top header. You will need your designated student registration number and access pin to securely download or view terminal result sheets.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item wow fadeInUp" data-wow-delay=".4s">
                                <h2 class="accordion-header" id="faqThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaqThree" aria-expanded="false">
                                        What extra-curricular activities are available?
                                    </button>
                                </h2>
                                <div id="collapseFaqThree" class="accordion-collapse collapse" data-bs-parent="#faqAccordionPage">
                                    <div class="accordion-body">
                                        <p>We believe in holistic growth and encourage physical education, performing arts, chess club, robotic championships, digital design, and competitive swimming. Full sports complexes and coaching staff are dedicated to student athletics.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item wow fadeInUp" data-wow-delay=".5s">
                                <h2 class="accordion-header" id="faqFour">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaqFour" aria-expanded="false">
                                        What are the school hours and calendar?
                                    </button>
                                </h2>
                                <div id="collapseFaqFour" class="accordion-collapse collapse" data-bs-parent="#faqAccordionPage">
                                    <div class="accordion-body">
                                        <p>Classes operate Monday through Friday, from 08:00 AM to 04:00 PM. Extra-curricular sports and clubs typically run on selective weekdays after hours or scheduled Saturday mornings.</p>
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
