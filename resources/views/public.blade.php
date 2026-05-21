<!DOCTYPE html>
<html lang="en">
<head>
    <!-- ========== Meta Tags ========== -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Huss School - Education and LMS">

    <!-- ========== Page Title ========== -->
    <title inertia>{{ config('app.name', 'Huss School') }}</title>

    <!-- ========== Favicon Icon ========== -->
    <link rel="shortcut icon" href="/template/examin/assets/img/favicon.png" type="image/x-icon">

    <!-- ========== Start Stylesheet ========== -->
    <link href="/template/examin/assets/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="/template/examin/assets/css/elegant-icons.css" rel="stylesheet" />
    <link href="/template/examin/assets/css/magnific-popup.css" rel="stylesheet" />
    <link href="/template/examin/assets/css/owl.carousel.min.css" rel="stylesheet" />
    <link href="/template/examin/assets/css/owl.theme.default.min.css" rel="stylesheet" />
    <link href="/template/examin/assets/css/animate.css" rel="stylesheet" />
    <link href="/template/examin/assets/css/bootsnav.css" rel="stylesheet" />
    <link href="/template/examin/style.css" rel="stylesheet">
    <link href="/template/examin/assets/css/responsive.css" rel="stylesheet" />
    <!-- ========== End Stylesheet ========== -->

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body>

    <!-- Preloader Start -->
    <div class="se-pre-con"></div>
    <!-- Preloader Ends -->

    @inertia

    <!-- jQuery Frameworks
    ============================================= -->
    <script src="/template/examin/assets/js/jquery-3.7.1.min.js"></script>
    <script src="/template/examin/assets/js/bootstrap.bundle.min.js"></script>
    <script src="/template/examin/assets/js/jquery.appear.js"></script>
    <script src="/template/examin/assets/js/jquery.easing.min.js"></script>
    <script src="/template/examin/assets/js/jquery.magnific-popup.min.js"></script>
    <script src="/template/examin/assets/js/owl.carousel.min.js"></script>
    <script src="/template/examin/assets/js/wow.min.js"></script>
    <script src="/template/examin/assets/js/isotope.pkgd.min.js"></script>
    <script src="/template/examin/assets/js/imagesloaded.pkgd.min.js"></script>
    <script src="/template/examin/assets/js/count-to.js"></script>
    <script src="/template/examin/assets/js/loopcounter.js"></script>
    <script src="/template/examin/assets/js/jquery.nice-select.min.js"></script>
    <script src="/template/examin/assets/js/bootsnav.js"></script>
    <script src="/template/examin/assets/js/main.js"></script>

</body>
</html>
