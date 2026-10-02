import React, { useState } from 'react';
import { DxnLogo } from '../components/DxnLogo';
import { CountrySelect } from '../components/CountrySelect';
import { PhoneInput } from '../components/PhoneInput';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { validateDateOfBirth, validateEmail, validatePhone } from '../lib/validation';
import { RegistrationFormData } from '../types/registration';
import { 
  ShieldCheck, 
  Globe2, 
  ClipboardCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface RegistrationPageProps {
  onNavigateToAdmin: () => void;
}

export function RegistrationPage({ onNavigateToAdmin }: RegistrationPageProps) {
  // Current step 1 to 10
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    country: "المملكة العربية السعودية",
    firstName: "",
    fatherName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "ذكر",
    nationality: "المملكة العربية السعودية",
    identityNumber: "",
    phone: "+966 ",
    email: "",
    city: "",
    address: ""
  });

  // Validation errors per step
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Final confirmation checkbox in step 10
  const [confirmed, setConfirmed] = useState(false);
  
  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field change handler
  const updateField = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 2) {
      if (!formData.country.trim()) {
        newErrors.country = "يرجى اختيار دولة إقامتك الحالية";
      }
    } else if (step === 3) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "الاسم الأول مطلوب";
      }
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = "اسم الأب مطلوب";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "اللقب أو اسم العائلة مطلوب";
      }
    } else if (step === 4) {
      const dateErr = validateDateOfBirth(formData.birthDay, formData.birthMonth, formData.birthYear);
      if (dateErr) {
        newErrors.birthDate = dateErr;
      }
    } else if (step === 5) {
      if (!formData.gender) {
        newErrors.gender = "يرجى تحديد الجنس";
      }
      if (!formData.nationality.trim()) {
        newErrors.nationality = "يرجى تحديد جنسيتك";
      }
    } else if (step === 6) {
      if (!formData.identityNumber.trim()) {
        newErrors.identityNumber = "رقم الهوية الوطنية أو جواز السفر مطلوب";
      } else if (formData.identityNumber.trim().length < 5) {
        newErrors.identityNumber = "يرجى إدخال رقم هوية صالح لا يقل عن 5 خانات";
      }
    } else if (step === 7) {
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) {
        newErrors.phone = phoneErr;
      }
    } else if (step === 8) {
      const emailErr = validateEmail(formData.email);
      if (emailErr) {
        newErrors.email = emailErr;
      }
    } else if (step === 9) {
      if (!formData.city.trim()) {
        newErrors.city = "المدينة مطلوبة";
      }
      if (!formData.address.trim()) {
        newErrors.address = "اسم الشارع أو المنطقة مطلوب";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next step handler
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous step handler
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;

    // Validate all required steps
    for (let s = 2; s <= 9; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let isStaticHost = false;
      let savedRegistration = null;

      try {
        const response = await fetch('/api/registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            savedRegistration = data.registration;
          }
        } else if (response.status === 404) {
          // Static host like GitHub Pages where /api/ does not exist
          isStaticHost = true;
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'فشل في إرسال طلب التسجيل');
        }
      } catch {
        // Network error or static server
        isStaticHost = true;
      }

      if (isStaticHost && !savedRegistration) {
        // Save locally for static environments like GitHub Pages
        const local = JSON.parse(localStorage.getItem('dxn_local_registrations') || '[]');
        const nextId = local.length > 0 ? Math.max(...local.map((r: any) => r.id)) + 1 : 1001;
        const newReg = {
          ...formData,
          id: nextId,
          createdAt: new Date().toISOString(),
          status: 'جديد'
        };
        local.unshift(newReg);
        localStorage.setItem('dxn_local_registrations', JSON.stringify(local));
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to register new request
  const handleReset = () => {
    setFormData({
      country: "المملكة العربية السعودية",
      firstName: "",
      fatherName: "",
      lastName: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      gender: "ذكر",
      nationality: "المملكة العربية السعودية",
      identityNumber: "",
      phone: "+966 ",
      email: "",
      city: "",
      address: ""
    });
    setErrors({});
    setConfirmed(false);
    setIsSuccess(false);
    setCurrentStep(1);
  };

  // If in Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-[#141413] border border-[#d7ae55]/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle gold glow in background */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#d7ae55]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <DxnLogo className="w-16 h-16 ring-4 ring-[#d7ae55]/20 shadow-xl" />
          </div>

          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <h2 className="text-3xl font-bold text-[#f6f2ea] mb-3">شكراً لك</h2>
          <p className="text-lg text-[#f0cc77] font-medium mb-4">
            شكراً لك على إرسال بيانات التسجيل.
          </p>
          <p className="text-sm text-[#9f9a90] leading-relaxed mb-8 max-w-md mx-auto">
            تم استلام معلوماتك بنجاح، وسيتم إرسال معلومات حسابك عبر واتساب قريباً بعد مراجعة بياناتك واعتماد عضويتك لدى شركة DXN.
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-8 text-xs text-[#9f9a90] flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#d7ae55]" />
            <span>بياناتك محفوظة بشكل مشفر وآمن، ولا تتم مشاركتها مع أي جهة خارجية.</span>
          </div>

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#d7ae55]/20 flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تسجيل طلب جديد</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f6f2ea] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="border-b border-white/5 bg-[#0d0d0c]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand Right */}
          <div className="flex items-center gap-3">
            <DxnLogo className="w-11 h-11" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#f6f2ea] tracking-tight">DXN</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d7ae55]/15 text-[#f0cc77] border border-[#d7ae55]/30 font-medium">
                  بوابة التسجيل الرسمية
                </span>
              </div>
              <p className="text-xs text-[#9f9a90] hidden sm:block">عضوية عالمية في أكثر من 180 دولة</p>
            </div>
          </div>

          {/* Admin Access Button Left */}
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171716] border border-white/10 text-xs text-[#9f9a90] hover:text-[#f0cc77] hover:border-[#d7ae55]/40 transition-all active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-[#d7ae55]" />
            <span>دخول المشرف</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Right Column: Informative Brand Sidebar (Desktop & Mobile) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121211] border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7ae55]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d7ae55]/10 text-[#d7ae55] text-xs font-semibold mb-4 border border-[#d7ae55]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>عضوية DXN العالمية</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-[#f6f2ea] mb-4">
                خطوتك الأولى <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0cc77] to-[#d7ae55]">
                  نحو عالم DXN.
                </span>
              </h1>

              <p className="text-sm text-[#9f9a90] leading-relaxed mb-6">
                أكمل معلوماتك الأساسية عبر نموذج آمن وبسيط، وسيتواصل معك فريقنا بعد مراجعة طلبك وإصدار رقم عضويتك الدولية.
              </p>

              {/* Perks List */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-[#f6f2ea]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a19] border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>تجربة تسجيل آمنة وخاصة</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#f6f2ea]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a19] border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55] shrink-0">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <span>يدعم جميع دول العالم</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#f6f2ea]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a19] border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55] shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <span>مراجعة قبل الإرسال</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 text-xs text-[#9f9a90] font-medium text-center">
                مرحباً بك في مجتمع DXN العالمي
              </div>
            </div>
          </div>

          {/* Left Column: Multi-Step Interactive Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#141413] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
              
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-[#9f9a90] mb-2 font-medium">
                  <span className="text-[#f0cc77] font-semibold">
                    الخطوة {currentStep} من {totalSteps}
                  </span>
                  <span className="font-latin text-[11px] text-[#9f9a90]">
                    {Math.round((currentStep / totalSteps) * 100)}%
                  </span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 rounded-full bg-[#1e1e1d] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Form Body By Step */}
              <div className="min-h-[300px]">
                {/* STEP 1: الترحيب */}
                {currentStep === 1 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-2xl font-bold text-[#f6f2ea] mb-2">
                        أهلاً بك في خطوات التسجيل
                      </h2>
                      <p className="text-sm font-medium text-[#d7ae55] mb-4">
                        أهلاً بك في خطوات التسجيل والحصول على حساب شخصي في شركة DXN
                      </p>
                      <p className="text-sm text-[#9f9a90] leading-relaxed">
                        سنطلب منك بعض المعلومات الأساسية لإتمام طلب التسجيل. يرجى إدخال معلوماتك الصحيحة والتأكد منها قبل الإرسال.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1b1b19] border border-white/5 space-y-2 text-xs text-[#9f9a90]">
                      <div className="flex items-center gap-2 text-[#f6f2ea] font-medium">
                        <Check className="w-4 h-4 text-[#d7ae55]" />
                        <span>ماذا ستحتاج؟</span>
                      </div>
                      <p>• وثيقة إثبات هوية (بطاقة شخصية أو جواز سفر)</p>
                      <p>• رقم هاتف مفعل مع تطبيق واتساب</p>
                      <p>• بريدك الإلكتروني الشخصي</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] font-bold text-base hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#d7ae55]/20 flex items-center justify-center gap-2 mt-8"
                    >
                      <span>ابدأ الآن</span>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* STEP 2: الدولة الحالية */}
                {currentStep === 2 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        أين تقيم حالياً؟
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        اختر الدولة التي تقيم فيها حالياً من القائمة الشاملة.
                      </p>
                    </div>

                    <CountrySelect
                      value={formData.country}
                      onChange={(countryName, countryObj) => {
                        updateField('country', countryName);
                        // Also update phone dial code default if phone is empty or untouched
                        if (countryObj && (!formData.phone || formData.phone.trim() === '+966')) {
                          updateField('phone', `${countryObj.dialCode} `);
                        }
                      }}
                      label="الدولة"
                      error={errors.country}
                      placeholder="اكتب اسم الدولة للبحث..."
                    />

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#9f9a90]">
                      تشمل القائمة جميع دول العالم، وليس فقط الدول الموجودة في الملف.
                    </div>
                  </div>
                )}

                {/* STEP 3: الاسم */}
                {currentStep === 3 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        أدخل معلومات الاسم
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        اكتب اسمك كما يظهر في وثيقة الهوية.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                          الاسم الأول <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          placeholder="الاسم الأول (مثال: محمد)"
                          className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 ${
                            errors.firstName ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                          }`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
                      </div>

                      {/* Father's Name */}
                      <div>
                        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                          اسم الأب <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fatherName}
                          onChange={(e) => updateField('fatherName', e.target.value)}
                          placeholder="اسم الأب (مثال: عبدالله)"
                          className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 ${
                            errors.fatherName ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                          }`}
                        />
                        {errors.fatherName && <p className="mt-1 text-xs text-red-400">{errors.fatherName}</p>}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                          اللقب أو الكنية <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          placeholder="اللقب أو اسم العائلة (مثال: الغامدي)"
                          className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 ${
                            errors.lastName ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                          }`}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: تاريخ الميلاد */}
                {currentStep === 4 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        متى وُلدت؟
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        أدخل تاريخ ميلادك بدقة كما هو مسجل في بطاقة الهوية أو جواز السفر.
                      </p>
                    </div>

                    <BirthDatePicker
                      day={formData.birthDay}
                      month={formData.birthMonth}
                      year={formData.birthYear}
                      onChange={(field, val) => updateField(field, val)}
                      error={errors.birthDate}
                    />
                  </div>
                )}

                {/* STEP 5: الجنس والجنسية */}
                {currentStep === 5 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        المعلومات الشخصية
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        حدد جنسك وجنسيتك الرسمية.
                      </p>
                    </div>

                    {/* Question 1: هل أنت؟ */}
                    <div>
                      <label className="block text-sm font-medium text-[#d7ae55] mb-3">
                        هل أنت؟ <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => updateField('gender', 'ذكر')}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            formData.gender === 'ذكر'
                              ? 'bg-[#d7ae55]/15 border-[#d7ae55] text-[#f0cc77] ring-2 ring-[#d7ae55]/20 font-bold'
                              : 'bg-[#171716] border-white/10 text-[#f6f2ea] hover:border-white/20'
                          }`}
                        >
                          <span className="text-lg">ذكر</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateField('gender', 'أنثى')}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            formData.gender === 'أنثى'
                              ? 'bg-[#d7ae55]/15 border-[#d7ae55] text-[#f0cc77] ring-2 ring-[#d7ae55]/20 font-bold'
                              : 'bg-[#171716] border-white/10 text-[#f6f2ea] hover:border-white/20'
                          }`}
                        >
                          <span className="text-lg">أنثى</span>
                        </button>
                      </div>
                    </div>

                    {/* Question 2: الجنسية */}
                    <div>
                      <CountrySelect
                        value={formData.nationality}
                        onChange={(val) => updateField('nationality', val)}
                        label="ما هي جنسيتك؟"
                        error={errors.nationality}
                        placeholder="ابحث عن جنسيتك من قائمة الدول..."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 6: الهوية */}
                {currentStep === 6 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        بيانات الهوية
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        أدخل رقم الهوية الشخصية أو جواز السفر لتوثيق العضوية.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                        رقم البطاقة الشخصية أو جواز السفر <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.identityNumber}
                        onChange={(e) => updateField('identityNumber', e.target.value)}
                        placeholder="رقم الهوية الوطنية أو جواز السفر"
                        className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 ${
                          errors.identityNumber ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                        }`}
                      />
                      {errors.identityNumber && <p className="mt-1 text-xs text-red-400">{errors.identityNumber}</p>}
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                      <Lock className="w-4 h-4 text-[#d7ae55] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#9f9a90] leading-relaxed">
                        تُستخدم هذه البيانات لغرض إتمام إجراءات التسجيل فقط، وتتمتع بحماية مشددة وفق سياسات الخصوصية.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 7: الهاتف */}
                {currentStep === 7 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        اكتب رقم هاتفك
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        سيتم إرسال تفاصيل حسابك وكلمة المرور عبر واتساب على هذا الرقم.
                      </p>
                    </div>

                    <PhoneInput
                      value={formData.phone}
                      onChange={(val) => updateField('phone', val)}
                      selectedCountryName={formData.country}
                      error={errors.phone}
                    />
                  </div>
                )}

                {/* STEP 8: البريد الإلكتروني */}
                {currentStep === 8 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        ما بريدك الإلكتروني؟
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        أدخل بريدك الإلكتروني لاستلام إشعارات العضوية والفواتير.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                        البريد الإلكتروني <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="example@domain.com"
                        className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 text-left font-latin ${
                          errors.email ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 9: العنوان */}
                {currentStep === 9 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        أين تسكن؟
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        أدخل تفاصيل عنوانك الحالي لتوصيل المنتجات أو تحديد أقرب فرع إليك.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                          المدينة <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="المدينة (مثال: الرياض، دبي، القاهرة...)"
                          className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 ${
                            errors.city ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                          }`}
                        />
                        {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
                      </div>

                      {/* Street or District */}
                      <div>
                        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
                          اسم الشارع أو المنطقة <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          placeholder="الحي، اسم الشارع، أو أي علامة مميزة"
                          className={`w-full px-4 py-3 rounded-xl bg-[#171716] border text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:ring-1 resize-none ${
                            errors.address ? 'border-red-500/80 focus:ring-red-500' : 'border-white/10 focus:border-[#d7ae55] focus:ring-[#d7ae55]'
                          }`}
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 10: المراجعة والتأكيد */}
                {currentStep === 10 && (
                  <div className="space-y-6 text-right animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl font-bold text-[#f6f2ea] mb-1">
                        مراجعة البيانات
                      </h2>
                      <p className="text-xs text-[#9f9a90]">
                        يرجى مراجعة كافة بياناتك بعناية قبل إرسال طلب التسجيل. يمكنك تعديل أي حقل بالضغط على زر «تعديل».
                      </p>
                    </div>

                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                        {submitError}
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div className="divide-y divide-white/5 rounded-2xl bg-[#181817] border border-white/10 overflow-hidden text-sm">
                      {/* Country */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe2 className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">دولة الإقامة</span>
                            <span className="text-[#f6f2ea] font-medium">{formData.country}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Name */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">الاسم الكامل</span>
                            <span className="text-[#f6f2ea] font-medium">
                              {formData.firstName} {formData.fatherName} {formData.lastName}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Birth Date */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">تاريخ الميلاد</span>
                            <span className="text-[#f6f2ea] font-medium font-latin dir-ltr">
                              {formData.birthDay}/{formData.birthMonth}/{formData.birthYear}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Gender & Nationality */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">الجنس والجنسية</span>
                            <span className="text-[#f6f2ea] font-medium">
                              {formData.gender} — {formData.nationality}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(5)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* ID Number */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">رقم الهوية أو جواز السفر</span>
                            <span className="text-[#f6f2ea] font-medium font-latin">{formData.identityNumber}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(6)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Phone & Email */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">الهاتف والبريد</span>
                            <span className="text-[#f6f2ea] font-medium font-latin block dir-ltr text-right">
                              {formData.phone}
                            </span>
                            <span className="text-xs text-[#9f9a90] font-latin">{formData.email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(7)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Address */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-[#d7ae55]" />
                          <div>
                            <span className="text-xs text-[#9f9a90] block">المدينة والعنوان</span>
                            <span className="text-[#f6f2ea] font-medium">
                              {formData.city} — {formData.address}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(9)}
                          className="text-xs text-[#d7ae55] hover:underline px-2 py-1 rounded bg-[#d7ae55]/10"
                        >
                          تعديل
                        </button>
                      </div>
                    </div>

                    {/* Required Confirmation Checkbox */}
                    <div className="p-4 rounded-2xl bg-[#1b1b19] border border-[#d7ae55]/30">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-white/20 bg-[#141413] text-[#d7ae55] focus:ring-[#d7ae55] cursor-pointer accent-[#d7ae55]"
                        />
                        <span className="text-xs sm:text-sm text-[#f6f2ea] leading-relaxed">
                          أؤكد أن هذه هي معلوماتي الصحيحة وأوافق على إرسالها لإتمام إجراءات التسجيل.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Buttons (Steps 2 to 10) */}
              {currentStep > 1 && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-6 py-3 rounded-xl bg-[#1b1b1a] border border-white/10 text-sm text-[#f6f2ea] hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  {/* Next or Submit Button */}
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#d7ae55]/20 flex items-center gap-2"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!confirmed || isSubmitting}
                      className={`px-10 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        confirmed && !isSubmitting
                          ? 'bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] hover:brightness-110 active:scale-95 shadow-lg shadow-[#d7ae55]/20 cursor-pointer'
                          : 'bg-[#252523] text-[#9f9a90] cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#0c0d0e] border-t-transparent rounded-full animate-spin" />
                          <span>جاري التسجيل...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تسجيل</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-[#9f9a90]">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} DXN International. بوابة التسجيل الرسمية.</p>
      </footer>
    </div>
  );
}
