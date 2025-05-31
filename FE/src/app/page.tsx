'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Dumbbell, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const LandingPage: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic'
    });

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId as string);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="h-screen bg-cover bg-center relative"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")' 
        }}
      >
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-50 bg-black bg-opacity-30 backdrop-blur-sm"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="text-white text-2xl font-bold"
          >
            GYM VN Fitness & Yoga
          </motion.div>
          <div className="flex space-x-8 items-center">
            <motion.a 
              whileHover={{ scale: 1.1, y: -3 }}
              href="#gioi-thieu" 
              className="text-white hover:text-blue-300 transition-colors font-medium text-lg tracking-wide hover:underline"
            >
              Giới thiệu
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, y: -3 }}
              href="#trainers" 
              className="text-white hover:text-blue-300 transition-colors font-medium text-lg tracking-wide hover:underline"
            >
              Huấn luyện viên
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, y: -3 }}
              href="#location" 
              className="text-white hover:text-blue-300 transition-colors font-medium text-lg tracking-wide hover:underline"
            >
              Vị trí
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors text-lg font-medium">
                Đăng nhập
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Nơi để bạn tạo ra <span className="text-blue-500">phiên bản tốt nhất</span> của chính mình
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-gray-200 mb-10 max-w-3xl"
          >
            Phòng tập của chúng tôi tự hào mang đến cho bạn những trang thiết bị hiện đại nhất cùng đội ngũ huấn luyện viên chuyên nghiệp, sẵn sàng hỗ trợ bạn đạt mục tiêu sức khỏe.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors flex items-center justify-center">
                Bắt đầu ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#gioi-thieu" 
              className="border border-white text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center"
            >
              Tìm hiểu thêm
            </motion.a>
          </motion.div>
        </div>

        <motion.div 
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5 
          }}
          className="absolute bottom-10 left-0 right-0 flex justify-center"
        >
          <a href="#gioi-thieu">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </a>
        </motion.div>
      </div>

      <section id="gioi-thieu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Về Phòng Tập Chúng Tôi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GYM VN Fitness & Yoga là phòng tập thể hình hiện đại nhất tại thành phố, với sứ mệnh giúp mọi người có được sức khỏe tốt nhất và vóc dáng lý tưởng.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Thiết Bị Hiện Đại</h3>
              <p className="text-gray-600">
                Phòng tập được trang bị những thiết bị tập luyện hiện đại nhất, đảm bảo hiệu quả tập luyện tối ưu và an toàn.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Huấn Luyện Viên Chuyên Nghiệp</h3>
              <p className="text-gray-600">
                Đội ngũ PT có kinh nghiệm, được đào tạo chuyên sâu, luôn sẵn sàng hỗ trợ bạn đạt được mục tiêu.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Dịch Vụ 5 Sao</h3>
              <p className="text-gray-600">
                Chúng tôi cam kết mang đến trải nghiệm tập luyện tốt nhất với các tiện nghi và dịch vụ chăm sóc khách hàng hàng đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="trainers" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đội Ngũ Huấn Luyện Viên</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gặp gỡ các huấn luyện viên chuyên nghiệp của chúng tôi, những người sẽ đồng hành cùng bạn trong hành trình tập luyện.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md" data-aos="flip-left" data-aos-delay="100">
              <div className="aspect-w-1 aspect-h-1 mb-6 overflow-hidden rounded-md">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop"
                  alt="Huấn luyện viên Nguyễn Văn A"
                  className="object-cover w-full h-64 rounded-md transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Nguyễn Văn A</h3>
              <p className="text-blue-600 font-medium mb-4">Chuyên gia thể hình</p>
              <p className="text-gray-600">
                Với hơn 8 năm kinh nghiệm, PT A là chuyên gia trong các bài tập phát triển cơ bắp và sức mạnh.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md" data-aos="flip-left" data-aos-delay="200">
              <div className="aspect-w-1 aspect-h-1 mb-6 overflow-hidden rounded-md">
                <img
                  src="https://images.unsplash.com/photo-1593164842249-d74fc06dae05?q=80&w=1374&auto=format&fit=crop"
                  alt="Huấn luyện viên Trần Thị B"
                  className="object-cover w-full h-64 rounded-md transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Trần Thị B</h3>
              <p className="text-blue-600 font-medium mb-4">Chuyên gia dinh dưỡng thể thao</p>
              <p className="text-gray-600">
                PT B kết hợp kiến thức về dinh dưỡng và tập luyện để giúp học viên đạt kết quả tối ưu.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md" data-aos="flip-left" data-aos-delay="300">
              <div className="aspect-w-1 aspect-h-1 mb-6 overflow-hidden rounded-md">
                <img
                  src="https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=1470&auto=format&fit=crop"
                  alt="Huấn luyện viên Lê Văn C"
                  className="object-cover w-full h-64 rounded-md transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Lê Văn C</h3>
              <p className="text-blue-600 font-medium mb-4">Chuyên gia cardio và giảm cân</p>
              <p className="text-gray-600">
                PT C sẽ giúp bạn đốt cháy mỡ thừa và cải thiện sức bền với các bài tập cardio hiệu quả.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Vị Trí Của Chúng Tôi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Phòng tập GYM VN Fitness & Yoga được đặt tại vị trí trung tâm, dễ dàng tiếp cận từ mọi khu vực của thành phố.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/2" data-aos="fade-right" data-aos-duration="1200">
              <div className="bg-gray-100 p-4 rounded-lg h-full shadow-md hover:shadow-xl transition-shadow">
                <div className="h-96 rounded-md overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0966890111442!2d105.84800807498467!3d21.0231156872779!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x1babf5acefc9865d!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IGNow61uaCBWaeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1714036205459!5m2!1svi!2s" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-md"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="md:w-1/2" data-aos="fade-left" data-aos-duration="1200">
              <div className="bg-gray-50 p-8 rounded-lg h-full shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <MapPin className="mr-2 text-blue-600" /> Địa chỉ của chúng tôi
                </h3>
                <p className="text-gray-700 mb-6 text-lg">
                  <a 
                    href="https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+Vi%E1%BB%85n+th%C3%B4ng/@21.0231157,105.8480081,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab953357c995:0x1babf5acefc9865d!8m2!3d21.0231157!4d105.8505883!16s%2Fm%2F0r4kbjq?entry=ttu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors duration-300 hover:underline inline-block relative group"
                    title="Nhấp để xem trên Google Maps"
                  >
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội<br />
                    Việt Nam</span>
                    <span className="absolute -left-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </span>
                  </a>
                </p>

                <h4 className="text-xl font-medium mb-4">Giờ mở cửa:</h4>
                <ul className="space-y-2 text-gray-600 mb-8">
                  <li className="flex justify-between">
                    <span>Thứ Hai - Thứ Sáu:</span>
                    <span className="font-medium">6:00 - 22:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Thứ Bảy:</span>
                    <span className="font-medium">7:00 - 21:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Chủ Nhật:</span>
                    <span className="font-medium">8:00 - 20:00</span>
                  </li>
                </ul>

                <h4 className="text-xl font-medium mb-4">Liên hệ:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <a 
                      href="tel:02412345678" 
                      className="hover:text-blue-600 transition-all duration-300 hover:underline inline-flex items-center relative group"
                      title="Nhấp để gọi điện"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                      </svg>
                      <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">Điện thoại: (024) 1234 5678</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:info@gymvnfitness.com" 
                      className="hover:text-blue-600 transition-all duration-300 hover:underline inline-flex items-center relative group"
                      title="Nhấp để gửi email"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                      <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">Email: info@gymvnfitness.com</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle id="pattern-circle" cx="25" cy="25" r="12" fill="#ffffff"></circle>
            </pattern>
            <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div data-aos="zoom-in">
            <h2 className="text-3xl font-bold text-white mb-6">
              Sẵn sàng để bắt đầu hành trình rèn luyện sức khỏe?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Đăng ký ngay hôm nay để nhận được tư vấn miễn phí từ đội ngũ huấn luyện viên chuyên nghiệp của chúng tôi.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              data-aos="fade-up"
            >
              <Link href="/login" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-md text-lg font-medium transition-colors inline-block shadow-md">
                Đăng nhập ngay
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-2xl font-bold mb-4">GYM VN Fitness & Yoga</h3>
              <p className="text-gray-400 max-w-xs">
                Phòng tập thể hình hiện đại nhất với các thiết bị và dịch vụ hàng đầu.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.06-.976.044-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.054-.06 1.37-.06 4.04 0 2.67.01 2.986.06 4.04.044.976.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.046 1.37.06 4.04.06 2.67 0 2.987-.01 4.04-.06.976-.044 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.054.06-1.37.06-4.04 0-2.67-.01-2.986-.06-4.04-.044-.976-.207-1.504-.344-1.857-.182-.467-.398-.8-.748-1.15-.35-.35-.683-.566-1.15-.748-.353-.137-.882-.3-1.857-.344-1.054-.047-1.37-.06-4.04-.06zm0 12.476a3.278 3.278 0 1 1 0-6.557 3.278 3.278 0 0 1 0 6.557zm0-8.326a5.05 5.05 0 1 0 0 10.1 5.05 5.05 0 0 0 0-10.1zm7.846-.12a1.18 1.18 0 1 1-2.36 0 1.18 1.18 0 0 1 2.36 0z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="mb-8 md:mb-0" data-aos="fade-up" data-aos-delay="200">
              <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li>
                  <motion.a 
                    whileHover={{ x: 5 }}
                    href="#gioi-thieu" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Giới thiệu
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    whileHover={{ x: 5 }}
                    href="#trainers" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Huấn luyện viên
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    whileHover={{ x: 5 }}
                    href="#location" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Vị trí
                  </motion.a>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/login" className="text-gray-400 hover:text-white transition-colors inline-flex items-center">
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      Đăng nhập
                    </Link>
                  </motion.div>
                </li>
              </ul>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="300">
              <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2">
                <li className="text-gray-400 flex items-start">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0 mt-1" />
                  <a 
                    href="https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+Vi%E1%BB%85n+th%C3%B4ng/@21.0231157,105.8480081,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab953357c995:0x1babf5acefc9865d!8m2!3d21.0231157!4d105.8505883!16s%2Fm%2F0r4kbjq?entry=ttu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-300 hover:underline group inline-flex items-center"
                    title="Nhấp để xem trên Google Maps"
                  >
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                      122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội
                    </span>
                  </a>
                </li>
                <li className="text-gray-400 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  <a 
                    href="tel:02412345678" 
                    className="hover:text-white transition-all duration-300 hover:underline group inline-flex items-center"
                    title="Nhấp để gọi điện"
                  >
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                      (024) 1234 5678
                    </span>
                  </a>
                </li>
                <li className="text-gray-400 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a 
                    href="mailto:info@gymvnfitness.com" 
                    className="hover:text-white transition-all duration-300 hover:underline group inline-flex items-center"
                    title="Nhấp để gửi email"
                  >
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                      info@gymvnfitness.com
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} GYM VN Fitness & Yoga. Đã đăng ký bản quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;