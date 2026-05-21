(function($) {
    "use strict";
  
    const $documentOn = $(document);
    const $windowOn = $(window);
  
    $documentOn.ready( function() {
  
      /* ================================
       Mobile Menu Js Start
    ================================ */
    
    $('#mobile-menu').meanmenu({
        meanMenuContainer: '.mobile-menu',
        meanScreenWidth: "1199",
        meanExpand: ['<i class="far fa-plus"></i>'],
    });
    
     /* ================================
       Sidebar Toggle Js Start
    ================================ */

      $(".offcanvas__close,.offcanvas__overlay").on("click", function () {
        $(".offcanvas__info").removeClass("info-open");
        $(".offcanvas__overlay").removeClass("overlay-open");
      });
      $(".sidebar__toggle").on("click", function () {
        $(".offcanvas__info").addClass("info-open");
        $(".offcanvas__overlay").addClass("overlay-open");
      });
      
       /* ================================
       Body Overlay Js Start
    ================================ */

      $(".body-overlay").on("click", function () {
        $(".offcanvas__area").removeClass("offcanvas-opened");
        $(".df-search-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");
      });
  
      /* ================================
       Sticky Header Js Start
    ================================ */

      $windowOn.on("scroll", function () {
        if ($(this).scrollTop() > 250) {
          $("#header-sticky").addClass("sticky");
        } else {
          $("#header-sticky").removeClass("sticky");
        }
      });      
      
       /* ================================
       Video & Image Popup Js Start
    ================================ */

      $(".img-popup").magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });

      $(".video-popup").magnificPopup({
        type: "iframe",
        callbacks: {},
      });
  
      /* ================================
       Counterup Js Start
    ================================ */

      $(".gt-count").counterUp({
        delay: 15,
        time: 4000,
      });
  
      /* ================================
       Wow Animation Js Start
    ================================ */

      new WOW().init();
  
      /* ================================
       Nice Select Js Start
    ================================ */

    if ($('.single-select').length) {
        $('.single-select').niceSelect();
    }

    //>> Hero-1 Slider Start <<//
         const sliderActive2 = ".hero-slider";
         const sliderInit2 = new Swiper(sliderActive2, {
             loop: true,
             slidesPerView: 1,
             effect: "fade",
             speed: 3000,
             autoplay: {
                 delay: 3000,
                 disableOnInteraction: false,
             },
            pagination: {
                el: ".swiper-dot-4",
                clickable: true,
            },
         });
 
        function animated_swiper(selector, init) {
            const animated = function animated() {
                $(selector + " [data-animation]").each(function () {
                    let anim = $(this).data("animation");
                    let delay = $(this).data("delay");
                    let duration = $(this).data("duration");
                    $(this)
                        .removeClass("anim" + anim)
                        .addClass(anim + " animated")
                        .css({
                            webkitAnimationDelay: delay,
                            animationDelay: delay,
                            webkitAnimationDuration: duration,
                            animationDuration: duration,
                        })
                        .one("animationend", function () {
                            $(this).removeClass(anim + " animated");
                        });
                });
            };
            animated();
            init.on("slideChange", function () {
                $(sliderActive2 + " [data-animation]").removeClass("animated");
            });
            init.on("slideChange", animated);
        }
        animated_swiper(sliderActive2, sliderInit2);

     /* ================================
       Brand Slider Js Start
    ================================ */

    if($('.gt-brand-slider').length > 0) {
        const gtBrandSlider = new Swiper(".gt-brand-slider", {
            slidesPerView: 'auto',
            spaceBetween: 100,
            freemode: true,
            centeredSlides: true,
            loop: true,
            speed: 4000,
            allowTouchMove: false,
            autoplay: {
                delay: 1,
                disableOnInteraction: true,
            },
        });
    }

 
    /* ================================
       Service List Js Start
    ================================ */
    $(".service-list .single-service").on("mouseenter", function (e) {
		// // Get the index of the hovered content list item
		var index = $(this).index();
		// Remove the 'active' class from all image list items
		$(".service-img-group li").removeClass("active");
		// Add the 'active' class to the corresponding image list item
		$(".service-img-group li:eq(" + index + ")").addClass("active");
	});

    /* ================================
       Project List Js Start
    ================================ */
    $(".project-list .single-project").on("mouseenter", function (e) {
		// // Get the index of the hovered content list item
		var index = $(this).index();
		// Remove the 'active' class from all image list items
		$(".project-img-group li").removeClass("active");
		// Add the 'active' class to the corresponding image list item
		$(".project-img-group li:eq(" + index + ")").addClass("active");
	});

    /* ================================
       Brand Slider-3 Js Start
    ================================ */
    if($('.brand-slider-3').length > 0) {
        const BrandSlider3 = new Swiper(".brand-slider-3", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".array-prev",
                prevEl: ".array-next",
            },
            breakpoints: {
                1199: {
                    slidesPerView: 7,
                },
                991: {
                    slidesPerView: 5,
                },
                767: {
                    slidesPerView: 4,
                },
                575: {
                    slidesPerView: 3,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

     //>> Hero Slider Start <<//
       var swiper = new Swiper(".hero-slider-1", {
        loop: true,
        autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        },
        speed: 800,
        effect: "slide", // left theke asbe
        navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".dot-number",
            clickable: true,
            renderBullet: function(index, className) {
                const dotContent = document.querySelectorAll(
                    ".dot-number .dot-num"
                );
                return `
            <span class="${className}">
                ${dotContent[index]?.outerHTML || ""}
            </span>
        `;
            },
        },
  });

   //>> Image Slider Start <<//
      var swiper = new Swiper(".image-slider", {
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
          el: ".dot-number",
          clickable: true,
          renderBullet: function(index, className) {
              const dotContent = document.querySelectorAll(
                  ".dot-number .dot-num"
              );
              return `
          <span class="${className}">
              ${dotContent[index]?.outerHTML || ""}
          </span>
        `;
            },
        },
      speed: 800,
      effect: "slide",
      on: {
        slideChangeTransitionStart: function () {
          document.querySelectorAll('.hero-image img').forEach(img => {
            img.classList.remove('animate__fadeInUp'); 
          });
        },
        slideChangeTransitionEnd: function () {
          let activeImg = document.querySelector('.swiper-slide-active .hero-image img');
          if(activeImg){
            activeImg.classList.add('animate__animated', 'animate__fadeInUp');
          }
        }
      }
    });
    
     /* ================================
       Project Slider-4 Js Start
    ================================ */
     if($('.project-slider-4').length > 0) {
        const ProjectSlider4 = new Swiper(".project-slider-4", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".array-prev",
                prevEl: ".array-next",
            },
            breakpoints: {
                1199: {
                    slidesPerView: 4,
                },
                991: {
                    slidesPerView: 3,
                },
                767: {
                    slidesPerView: 2,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

   /* ================================
       Instagram Slider Js Start
    ================================ */

    if($('.gt-instagram-slider').length > 0) {
        const gtInstagramSlider = new Swiper(".gt-instagram-slider", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },

            breakpoints: {
                1199: {
                    slidesPerView: 5,
                },
                991: {
                    slidesPerView: 4,
                },
                767: {
                    slidesPerView: 3,
                },
                575: {
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

    if($('.gt-instagram-slider-2').length > 0) {
        const gtInstagramSlider2 = new Swiper(".gt-instagram-slider-2", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },

            breakpoints: {
                1399: {
                    slidesPerView: 6,
                },
                1199: {
                    slidesPerView: 5,
                },
                991: {
                    slidesPerView: 4,
                },
                767: {
                    slidesPerView: 3,
                },
                575: {
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

     if($('.gt-instagram-slider-3').length > 0) {
        const gtInstagramSlider3 = new Swiper(".gt-instagram-slider-3", {
            spaceBetween: 10,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },

            breakpoints: {
                1399: {
                    slidesPerView: 7,
                },
                1199: {
                    slidesPerView: 6,
                },
                991: {
                    slidesPerView: 5,
                },
                767: {
                    slidesPerView: 4,
                },
                575: {
                    slidesPerView: 3,
                },
                 400: {
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

   /* ================================
       Testimonial Sliders Js Start
    ================================ */

    if ($('.gt-testimonial-slider-thumb').length > 0 && $('.gt-testimonial-content-slider').length > 0) {
    
      // First, initialize the thumbnail swiper
      const gtTestimonialSliderThumb = new Swiper(".gt-testimonial-slider-thumb", {
          spaceBetween: 30,
          speed: 1300,
          loop: true,
          centeredSlides: true,
          autoplay: {
              delay: 2000,
              disableOnInteraction: false,
          },
          // slidesPerView: 7,
          breakpoints: {
              575: { slidesPerView: 7 },
              0: { slidesPerView: 1 },
          },
          navigation: {
            nextEl: ".array-prev",
            prevEl: ".array-next",
        },
      });
  
      // Then, initialize the main content swiper and link the thumbnails
      const gtTestimonialContentSlider = new Swiper(".gt-testimonial-content-slider", {
          spaceBetween: 30,
          speed: 1300,
          loop: true,
          centeredSlides: true,
          autoplay: {
              delay: 2000,
              disableOnInteraction: false,
          },
          slidesPerView: 1,
          thumbs: {
              swiper: gtTestimonialSliderThumb,
          },
          breakpoints: {
              1199: { slidesPerView: 3 },
              991: { slidesPerView: 2 },
              767: { slidesPerView: 2 },
              575: { slidesPerView: 1 },
              0: { slidesPerView: 1 },
          },
          navigation: {
            nextEl: ".array-prev",
            prevEl: ".array-next",
        },
      });
    }

    if ($('.gt-testimonial-slider-thumb2').length > 0 && $('.gt-testimonial-content-slider2').length > 0) {
    
      // First, initialize the thumbnail swiper
      const gtTestimonialSliderThumb2 = new Swiper(".gt-testimonial-slider-thumb2", {
          spaceBetween: 30,
          speed: 1300,
          loop: true,
          centeredSlides: true,
          autoplay: {
              delay: 2000,
              disableOnInteraction: false,
          },
          // slidesPerView: 7,
          breakpoints: {
              575: { slidesPerView: 7 },
              0: { slidesPerView: 1 },
          },
          navigation: {
            nextEl: ".array-prev",
            prevEl: ".array-next",
        },
      });
  
      // Then, initialize the main content swiper and link the thumbnails
      const gtTestimonialContentSlider2 = new Swiper(".gt-testimonial-content-slider2", {
          spaceBetween: 30,
          speed: 1300,
          loop: true,
          centeredSlides: true,
          autoplay: {
              delay: 2000,
              disableOnInteraction: false,
          },
          slidesPerView: 1,
          thumbs: {
              swiper: gtTestimonialSliderThumb2,
          },
          navigation: {
            nextEl: ".array-prev",
            prevEl: ".array-next",
        },
      });
    }

      //>> Testimonial Slider Start <<//
        if($('.testimonial-slider-2').length > 0) {
            const testimonialSlider2 = new Swiper(".testimonial-slider-2", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                 navigation: {
                    nextEl: ".array-prev",
                    prevEl: ".array-next",
                },
                 pagination: {
                    el: ".dot",
                    clickable: true,
                },
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                 breakpoints: {
                    1199: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                     0: {
                        slidesPerView: 1,
                    },
                },
            });
        }
    
    if($('.gt-testimonial-slider-3').length > 0) {
        const gttestimonialslider3 = new Swiper(".gt-testimonial-slider-3", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            breakpoints: {
                1199: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

     if($('.gt-rental-slider').length > 0) {
        const gtRentalSlider = new Swiper(".gt-rental-slider", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".array-prev",
                prevEl: ".array-next",
            },
            breakpoints: {
                1199: {
                    slidesPerView: 3,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

    $(document).ready(function () {
    function initSlick() {
        if ($(window).width() > 768) {
        if (!$(".my-slider").hasClass("slick-initialized")) {
            $(".my-slider").slick({
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            variableWidth: true,
            arrows: true,
            dots: false,
            autoplay: true,
            autoplaySpeed: 3000,
            prevArrow: $(".array-prev"),
            nextArrow: $(".array-next"),

            responsive: [
                {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    infinite: true,
                },
                },
                {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    dots: true,
                },
                },
            ],
            });

            $(".my-slider .thumb").first().addClass("active");
        }
        } else {
      
        if ($(".my-slider").hasClass("slick-initialized")) {
            $(".my-slider").slick("unslick");
        }
        }
    }

    // Initial load
    initSlick();

    // Reinitialize on resize
    $(window).on("resize", function () {
        initSlick();
    });

    // Hover effect for thumb
    $(".my-slider").on("mouseenter", ".thumb", function () {
        $(".thumb").removeClass("active");
        $(this).addClass("active");
    });
    });

     /* ================================
       Shop Slider Js Start
    ================================ */

    if($('.gt-shop-slider').length > 0) {
        const gtShopSlider = new Swiper(".gt-shop-slider", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".array-prev",
                prevEl: ".array-next",
            },
            breakpoints: {
                1199: {
                    slidesPerView: 3,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }
    
    if($('.service-slider').length > 0) {
        const ServiceSlider = new Swiper(".service-slider", {
            spaceBetween: 30,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".dot",
                clickable: true,
            },
            breakpoints: {
                1199: {
                    slidesPerView: 5,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }

    /* ================================
   Portfolio Hover Js Start
================================ */
   

    /* ================================
       Box Slider Js Start
    ================================ */

    if($('.box-slider').length > 0) {
        const boxSlider = new Swiper(".box-slider", {
            loop: true,
            slidesPerView: 'auto',
            speed: 19000, 
            freeMode: true,
            spaceBetween: 470,
            centeredSlides: true,
            autoplay: {
                delay: 0, 
                disableOnInteraction: false,
            },
        });
    }

    /* ================================
       Dynamic Image Switch Js Start
    ================================ */
   
    // Image src and class add js area start here ***
    $(document).on("mouseenter", ".changeImage2", function () {
        let newImage = $(this).data("image");
        let fadeDuration = 200;

        $("#myImage2").fadeOut(fadeDuration, function () {
            $("#myImage2").attr("src", newImage);
            $("#myImage2").fadeIn(fadeDuration);
        });

        $(this).addClass("clicked");
        $(".changeImage2").not(this).removeClass("clicked");
    });
    // Image src and class add js area end here ***

   /* ================================
       Countdown Timer Js Start
    ================================ */

   (function () {
    const targetDate = new Date("2025-09-20T00:00:00").getTime();
  
    const countdownInterval = setInterval(() => {
      const currentDate = Date.now();
      const remainingTime = targetDate - currentDate;
  
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        $("#countdown-container").text("Countdown has ended!");
        return;
      }
  
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
  
      $("#day").text(days.toString().padStart(2, "0"));
      $("#hour").text(hours.toString().padStart(2, "0"));
      $("#min").text(minutes.toString().padStart(2, "0"));
      $("#sec").text(seconds.toString().padStart(2, "0"));
    }, 1000);
  })();
  
     /* ================================
       Team Hover Interaction Js Start
    ================================ */

    const contentBoxes = document.querySelectorAll('.gt-content-box');
    const teamBoxes = document.querySelectorAll('.gt-team-box-items');

    contentBoxes.forEach((contentBox, index) => {
        const teamBox = teamBoxes[index];

        const addHover = () => {
            teamBox.classList.add('hovered');
        };

        const removeHover = (e) => {
            // If moving to contentBox or teamBox, do not remove
            const toElement = e.relatedTarget;
            if (contentBox.contains(toElement) || teamBox.contains(toElement)) {
                return;
            }
            teamBox.classList.remove('hovered');
        };

        // Add event listeners to both content and team boxes
        contentBox.addEventListener('mouseenter', addHover);
        contentBox.addEventListener('mouseleave', removeHover);

        teamBox.addEventListener('mouseenter', addHover);
        teamBox.addEventListener('mouseleave', removeHover);
    });


   /* ================================
       Progress Bar Animation Js Start
    ================================ */

    $('.gt-progress-bar').waypoint(function() {
        $('.gt-progress-bar').css({
            animation: "animate-positive 2.6s",
            opacity: "1"
        });
    }, { offset: '75%' });

   /* ================================
       Custom Accordion Js Start
    ================================ */

    $(".accordion-single .header-area").on("click", function () {
        if ($(this).closest(".accordion-single").hasClass("active")) {
            $(this).closest(".accordion-single").removeClass("active");
            $(this).next(".content-area").slideUp();
        } else {
            $(".accordion-single").removeClass("active");
            $(this).closest(".accordion-single").addClass("active");
            $(".content-area").not($(this).next(".content-area")).slideUp();
            $(this).next(".content-area").slideToggle();
        }
    });

    /* ================================
        Quantity Increment/Decrement Js Start
    ================================ */
    const quantityButtons = document.querySelectorAll(".quantityIncrement, .quantityDecrement");
    if (quantityButtons.length) {
        quantityButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const input = button.parentElement.querySelector("input");
                let value = parseInt(input.value, 10) || 0;

                if (button.classList.contains("quantityIncrement")) {
                    input.value = value + 1;
                } else if (button.classList.contains("quantityDecrement") && value > 1) {
                    input.value = value - 1;
                }
            });
        });
    }
    
    
     /* ================================
       Payment Method Update Js Start
    ================================ */

    function updatePaymentMethod() {
        let paymentMethod = $("input[name='pay-method']:checked").val();
        $(".payment").html(paymentMethod);
    }

    // Initial load
    updatePaymentMethod();

    // On click of radio option
    $(".checkout-radio-single input[name='pay-method']").on("change", function () {
        updatePaymentMethod();
    });

     /* ================================
       Additional Quantity Controls Js Start
    ================================ */

    const inputs = document.querySelectorAll('#qty, #qty2, #qty3');
    const btnminus = document.querySelectorAll('.qtyminus');
    const btnplus = document.querySelectorAll('.qtyplus');

    if (inputs.length > 0 && btnminus.length > 0 && btnplus.length > 0) {

        inputs.forEach(function(input, index) {
            const min = Number(input.getAttribute('min'));
            const max = Number(input.getAttribute('max'));
            const step = Number(input.getAttribute('step'));

            function qtyminus(e) {
                const current = Number(input.value);
                const newval = (current - step);
                if (newval < min) {
                    newval = min;
                } else if (newval > max) {
                    newval = max;
                }
                input.value = Number(newval);
                e.preventDefault();
            }

            function qtyplus(e) {
                const current = Number(input.value);
                const newval = (current + step);
                if (newval > max) newval = max;
                input.value = Number(newval);
                e.preventDefault();
            }

            btnminus[index].addEventListener('click', qtyminus);
            btnplus[index].addEventListener('click', qtyplus);
        });
    }
    

     /* ================================
       Mouse Cursor Animation Js Start
    ================================ */

    if ($(".mouseCursor").length > 0) {
        function itCursor() {
            var myCursor = jQuery(".mouseCursor");
            if (myCursor.length) {
                if ($("body")) {
                    const e = document.querySelector(".cursor-inner"),
                        t = document.querySelector(".cursor-outer");
                    let n,
                        i = 0,
                        o = !1;
                    (window.onmousemove = function(s) {
                        o ||
                            (t.style.transform =
                                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                            (e.style.transform =
                                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                            (n = s.clientY),
                            (i = s.clientX);
                    }),
                    $("body").on(
                            "mouseenter",
                            "button, a, .cursor-pointer",
                            function() {
                                e.classList.add("cursor-hover"),
                                    t.classList.add("cursor-hover");
                            }
                        ),
                        $("body").on(
                            "mouseleave",
                            "button, a, .cursor-pointer",
                            function() {
                                ($(this).is("a", "button") &&
                                    $(this).closest(".cursor-pointer").length) ||
                                (e.classList.remove("cursor-hover"),
                                    t.classList.remove("cursor-hover"));
                            }
                        ),
                        (e.style.visibility = "visible"),
                        (t.style.visibility = "visible");
                }
            }
        }
        itCursor();
      }
  
      /* ================================
         Search Popup Toggle Js Start
      ================================ */
  
      if ($(".search-toggler").length) {
          $(".search-toggler").on("click", function(e) {
              e.preventDefault();
              $(".search-popup").toggleClass("active");
              $("body").toggleClass("locked");
          });
      }
  

    /* ================================
     Back To Top Button Js Start
    ================================ */

  // Function to toggle back-to-top button visibility
    function toggleBackTop() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
            $("#gt-back-top").addClass("show");
        } else {
            $("#gt-back-top").removeClass("show");
        }
    }

    // On scroll
    $windowOn.on('scroll', function() {
        toggleBackTop();
    });

    // On document ready, force hide the button
    $(document).ready(function() {
        $("#gt-back-top").removeClass("show");
    });

    // On click
    $documentOn.on('click', '#gt-back-top', function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

   
     /* ================================
       Preloader Start
    ================================ */
    
    // Observe all elements with scroll-in animations
    const animatedElements = document.querySelectorAll(
        ".scroll-in-left, .scroll-in-right, .gt-cta-image"
    );
    
    // Create a single intersection observer instance
    const observer = new IntersectionObserver(
        (entries) => {
        entries.forEach((entry) => {
            // Toggle 'in-view' class based on intersection state
            entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
        },
        {
        threshold: 0.5, // Trigger when 50% visible
        }
    );
  
  // Observe each element
  animatedElements.forEach((el) => observer.observe(el));

    
    }); // End Document Ready Function

   
   /* ================================
        Price Range Slider Js Start
        ================================ */
    document.addEventListener("DOMContentLoaded", function () {
        const minSlider = document.getElementById("min-slider");
        const maxSlider = document.getElementById("max-slider");
        const amount = document.getElementById("amount");
    
        // Exit early if essential elements are missing
        if (!minSlider || !maxSlider || !amount) return;
    
        function updateAmount() {
            let minValue = parseInt(minSlider.value, 10);
            let maxValue = parseInt(maxSlider.value, 10);
    
            // Swap values if min is greater than max
            if (minValue > maxValue) {
                [minValue, maxValue] = [maxValue, minValue];
                minSlider.value = minValue;
                maxSlider.value = maxValue;
            }
    
            // Update amount input
            amount.value = `$${minValue} - $${maxValue}`;
    
            // Calculate percentages for gradient
            const minPercent = ((minValue - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
            const maxPercent = ((maxValue - maxSlider.min) / (maxSlider.max - maxSlider.min)) * 100;
    
            const trackStyle = `linear-gradient(to right, #1D1D1D ${minPercent}%, #E63946 ${minPercent}%, #E63946 ${maxPercent}%, #1D1D1D ${maxPercent}%)`;
    
            minSlider.style.background = trackStyle;
            maxSlider.style.background = trackStyle;
        }
    
        // Initialize on page load
        updateAmount();
    
        // Add event listeners
        minSlider.addEventListener("input", updateAmount);
        maxSlider.addEventListener("input", updateAmount);
    });
        
     function loader() {
        $(window).on('load', function() {
            // Animate loader off screen
            $(".preloader").addClass('loaded');                    
            $(".preloader").delay(600).fadeOut();                       
        });
    }

    loader();
  
  })(jQuery); // End jQuery