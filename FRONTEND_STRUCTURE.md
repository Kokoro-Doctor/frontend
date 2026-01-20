# Frontend Folder Structure

This document shows the complete folder structure of the frontend directory.

frontend/
├── .gitignore
├── .vscode/
├── App.jsx
├── app.json
├── eas.json
├── env-vars.js
├── eslint.config.js
├── index.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
│
├── assets/
│
├── components/
│
├── constants/
│
├── contexts/
│
├── hooks/
│
├── navigation/
│
├── public/
│
├── scripts/
│
├── screens/
│
└── utils/

```
frontend/
├── .gitignore
├── .vscode/
│   └── settings.json
├── App.jsx
├── app.json
├── eas.json
├── env-vars.js
├── eslint.config.js
├── index.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
│
├── assets/
│   ├── DoctorsPortal/
│   │   ├── Icons/
│   │   │   ├── account.png
│   │   │   ├── appointment.png
│   │   │   ├── ArrowIcon.png
│   │   │   ├── backscreen.png
│   │   │   ├── bell.png
│   │   │   ├── bigbox.png
│   │   │   ├── calendar.png
│   │   │   ├── call_Icon.png
│   │   │   ├── cloudcheck.png
│   │   │   ├── cloudIcon1.png
│   │   │   ├── cloudIcon2.png
│   │   │   ├── cloudIcon3.png
│   │   │   ├── congrats.jpg
│   │   │   ├── Doctordashboard.png
│   │   │   ├── DoctorIcon.png
│   │   │   ├── doctorMedicalRegistration.png
│   │   │   ├── downArrow.png
│   │   │   ├── downloads.png
│   │   │   ├── DropdownArrow.png
│   │   │   ├── Files.png
│   │   │   ├── fileSave.png
│   │   │   ├── filter__Icon.png
│   │   │   ├── filterIcon.png
│   │   │   ├── GearSix.png
│   │   │   ├── gmeet.png
│   │   │   ├── greenTick.png
│   │   │   ├── help.png
│   │   │   ├── history.png
│   │   │   ├── icon1.png through icon10.png
│   │   │   ├── kokorologoo.png
│   │   │   ├── language.png
│   │   │   ├── mobilefilter.png
│   │   │   ├── mobilevideos.png
│   │   │   ├── notification2.png
│   │   │   ├── Notificationss.png
│   │   │   ├── paint-brush.png
│   │   │   ├── patientIcon.png
│   │   │   ├── pencil.png
│   │   │   ├── pending consultation.png
│   │   │   ├── plusSign.png
│   │   │   ├── Prescription-icon.png
│   │   │   ├── PrescriptionIcon.png
│   │   │   ├── quickPreview.png
│   │   │   ├── reminder.png
│   │   │   ├── search_Icon.png
│   │   │   ├── secondrowicon.png
│   │   │   ├── send_Icon.png
│   │   │   ├── smallbox.png
│   │   │   ├── star.png
│   │   │   ├── todayappointment.png
│   │   │   ├── upArrow.png
│   │   │   ├── upload.png
│   │   │   └── user.png
│   │   └── Images/
│   │       ├── Calender.png
│   │       ├── DoctorDashboard.png
│   │       ├── DrBuddy.png
│   │       ├── KokoroLogo.png
│   │       ├── MedicalVault.png
│   │       ├── Prescription.png
│   │       ├── rectanglebase.png
│   │       ├── subscriberIcon.png
│   │       ├── Subscribers.png
│   │       ├── userpic.png
│   │       └── VerifiedbyMCI.png
│   ├── fonts/
│   │   ├── OpenSans-Bold.ttf
│   │   └── OpenSans-Regular.ttf
│   ├── Icons/
│   │   ├── AboutUsPoints.png
│   │   ├── ambulance.png
│   │   ├── arrow.png
│   │   ├── BookingConfirmation.png
│   │   ├── cardiacHealth.png
│   │   ├── category.png
│   │   ├── CirclesFour.png
│   │   ├── cloudcheck.png
│   │   ├── CloudUpload.png
│   │   ├── consulting.png
│   │   ├── dashboard.png
│   │   ├── dashboardMedilocker.png
│   │   ├── dateIcon.png
│   │   ├── doctorTool.png
│   │   ├── dollarIcon.png
│   │   ├── DownArrow.png
│   │   ├── Envelope.png
│   │   ├── epsIcon.png
│   │   ├── file.png
│   │   ├── FileIcon.png
│   │   ├── files.png
│   │   ├── filter.png
│   │   ├── filterIcon.png
│   │   ├── forwardarrow.png
│   │   ├── gear.png
│   │   ├── GearSix.png
│   │   ├── GreenDot.png
│   │   ├── heart.png
│   │   ├── heart1.png
│   │   ├── heartbeat.png
│   │   ├── help.png
│   │   ├── home (1).png
│   │   ├── HomeProfile.png
│   │   ├── hospital-bed.png
│   │   ├── icondashboard.png
│   │   ├── icostarr.png
│   │   ├── instagram.png
│   │   ├── insurance.png
│   │   ├── kokoro.png
│   │   ├── languageSelector.png
│   │   ├── LeftButton.png
│   │   ├── LinkedIn.png
│   │   ├── LocationArrow .png
│   │   ├── LocationLogo.png
│   │   ├── loggedOut_userIcon.png
│   │   ├── mail.png
│   │   ├── Medical Shield.png
│   │   ├── medicalshield.png
│   │   ├── medilockerIcon.png
│   │   ├── notification.png
│   │   ├── notification1.png
│   │   ├── offline.png
│   │   ├── papers.png
│   │   ├── payment.png
│   │   ├── phone.png
│   │   ├── photo.png
│   │   ├── pricing.png
│   │   ├── PricingHeart.png
│   │   ├── profile.png
│   │   ├── profile1.png
│   │   ├── profiledashboard.png
│   │   ├── quickbase.png
│   │   ├── recycle.png
│   │   ├── RightButton.png
│   │   ├── rs.png
│   │   ├── search.png
│   │   ├── searchFilter2.png
│   │   ├── searchIcon.png
│   │   ├── SearchIcon2.png
│   │   ├── send.png
│   │   ├── Star.png
│   │   ├── statusIcon.png
│   │   ├── Subscription.png
│   │   ├── thankScreenTick.png
│   │   ├── tiltedPurpleLine.png
│   │   ├── time.png
│   │   ├── twitter.png
│   │   ├── upcoming.png
│   │   ├── Users.png
│   │   ├── Vector.png
│   │   ├── videocall.png
│   │   ├── Yellow_Star.png
│   │   └── youtube.png
│   └── Images/
│       ├── AI_Support.png
│       ├── Arroww.png
│       ├── background.jpg
│       ├── Calender_bro1.png
│       ├── coming_soon.png
│       ├── Congratulations.png
│       ├── Consultation.png
│       ├── doctorImage.jpg
│       ├── DoctorProfile.png
│       ├── doctorwithtablet.png
│       ├── Dr_Abhinit_Gupta.jpg
│       ├── dr_background.png
│       ├── Dr_Bikash_Majumder.jpg
│       ├── dr_kislay.jpg
│       ├── Dr_Ritesh_Singh.jpg
│       ├── Dr_Sandip_Rungta.jpg
│       ├── Dr_Vinesh_Jain.jpg
│       ├── Dr. Dhiraj Kumar Giri.jpg
│       ├── Dr. Himanshu Yadav.jpeg
│       ├── Dr. Kastubh Mahimane.jpg
│       ├── Dr. Manidipa Majumdar.jpg
│       ├── Dr. Supratip Kundu.jpeg
│       ├── google-icon.png
│       ├── Health-heart.jpeg
│       ├── healthyheart.jpg
│       ├── heart_background.png
│       ├── heartfail.png
│       ├── hearth.png
│       ├── hearth2.png
│       ├── HeartImage.jpg
│       ├── hospitalImage.jpeg
│       ├── HospitalImage2.jpg
│       ├── KokoroLogo.png
│       ├── kokoroLogomini.png
│       ├── login-background.png
│       ├── main_background.jpg
│       ├── Medical_Council_of_India_Logo.png
│       ├── MedicineBackground.png
│       ├── Medilocker.png
│       ├── Medilockerfile.jpg
│       ├── Patient.jpg
│       ├── popupCongrats.png
│       ├── PrivacyPolicy.png
│       ├── Rectangle.png
│       ├── regLogo.png
│       ├── right-arrow.png
│       ├── signup.png
│       ├── twenty-four_Support.png
│       ├── Union.png
│       ├── user-icon.jpg
│       ├── userdemo.jpeg
│       └── userpic.png
│
├── components/
│   ├── Auth/
│   │   ├── DoctorSignupModal.jsx
│   │   └── PatientAuthModal.jsx
│   ├── DoctorsPortalComponents/
│   │   ├── DoctorCard.jsx
│   │   ├── DoctorsHeader.jsx
│   │   ├── HeaderNavigation.jsx
│   │   ├── MedilockerUsers.jsx
│   │   ├── NewestSidebar.jsx
│   │   ├── NewSideNav.jsx
│   │   ├── SettingsNavigation.jsx
│   │   ├── SideImageStyle.jsx
│   │   └── SubscriberCard.jsx
│   └── PatientScreenComponents/
│       ├── ChatbotComponents/
│       │   ├── ChatBot.jsx
│       │   ├── ChatbotOverlay.jsx
│       │   ├── FormattedMessageText.jsx
│       │   ├── MobileChatbot.jsx
│       │   └── SignInPopup.jsx
│       ├── DoctorComponents/
│       │   ├── CongratulationsPopup.jsx
│       │   ├── DoctorAvailabilitySlotsComponent.jsx
│       │   ├── DoctorReviewThankYou.jsx
│       │   ├── DoctorsAppointmentData.jsx
│       │   └── StarRatingComponent.jsx
│       ├── HospitalComponents/
│       │   ├── HospitalAvailabilitySlotsComponent.jsx
│       │   └── HospitalCard.jsx
│       ├── Header.jsx
│       ├── HeaderLoginSignUp.jsx
│       ├── HealthCarePlan.jsx
│       ├── MyLinearGradient1.jsx
│       ├── PromoModal.jsx
│       ├── SearchBar.jsx
│       ├── SideBarNavigation.jsx
│       └── Title.jsx
│
├── constants/
│   └── Colors.ts
│
├── contexts/
│   ├── AuthContext.js
│   ├── AuthPopupContext.js
│   ├── ChatbotContext.js
│   ├── LoginModalContext.js
│   ├── RegistrationContext.js
│   ├── RoleContext.js
│   ├── ThemeContext.js
│   └── Themes.js
│
├── hooks/
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
│
├── navigation/
│   ├── AuthGate.js
│   ├── DoctorsNavigation.jsx
│   ├── PatientNavigation.jsx
│   └── RootNavigator.jsx
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── scripts/
│   └── reset-project.js
│
├── screens/
│   ├── DoctorScreens/
│   │   ├── AppointmentsView.jsx
│   │   ├── BookAppointmentsView.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── DoctorPortalLandingPage.jsx
│   │   ├── DoctorRegistration/
│   │   │   ├── DoctorCongrats.jsx
│   │   │   ├── DoctorMedicalRegistration.jsx
│   │   │   ├── DoctorPatientLandingPage.jsx
│   │   │   ├── DoctorsSignUp.jsx
│   │   │   ├── EstablishmentTiming.jsx
│   │   │   └── NewDoctorMedicalReg.jsx
│   │   ├── DoctorsSubscribers.jsx
│   │   ├── DrCalendarView.jsx
│   │   ├── GeneratePrescription.jsx
│   │   ├── History.jsx
│   │   ├── Prescription.jsx
│   │   ├── ReminderNewest.jsx
│   │   ├── ReminderView.jsx
│   │   └── Settings/
│   │       ├── AccountSettings.jsx
│   │       ├── EstablishmentTimings.jsx
│   │       ├── LanguagePreference.jsx
│   │       ├── MedicalProof.jsx
│   │       ├── NotificationSettings.jsx
│   │       ├── ProfileSetting.jsx
│   │       ├── SubscriberFees.jsx
│   │       └── ThemeSettings.jsx
│   └── PatientScreens/
│       ├── AboutUs/
│       │   ├── AboutUsHow.jsx
│       │   ├── AboutUsMain.jsx
│       │   ├── AboutUsWhat.jsx
│       │   └── AboutUsWhy.jsx
│       ├── Auth/
│       │   └── PrivacyPolicy.jsx
│       ├── BillReceipt.jsx
│       ├── ContactUs.jsx
│       ├── Doctors/
│       │   ├── App/
│       │   │   ├── AppDoctorsRating.jsx
│       │   │   ├── BookingConfirmation.jsx
│       │   │   ├── DoctorAvailabilitySlots.jsx
│       │   │   └── DoctorReviewScreen.jsx
│       │   ├── ConsultWithDoctors.jsx
│       │   ├── DoctorNearYou.jsx
│       │   ├── DoctorResultShow.jsx
│       │   ├── DoctorsBookingPaymentScreen.jsx
│       │   ├── DoctorsInfoWithBooking.jsx
│       │   ├── DoctorsInfoWithSubscription.jsx
│       │   ├── DoctorsNoResult.jsx
│       │   └── DoctorsSubscriptionPaymentScreen.jsx
│       ├── Error.jsx
│       ├── Help.jsx
│       ├── Hospitals/
│       │   ├── App/
│       │   │   ├── EmergencyLocation.jsx
│       │   │   ├── HospitalAvailability.jsx
│       │   │   ├── HospitalAvailabilitySlots.jsx
│       │   │   ├── HospitalBookingNext.jsx
│       │   │   └── HospitalPaymentApp.jsx
│       │   ├── AllHospitals.jsx
│       │   ├── BookHospitals.jsx
│       │   └── HospitalsInfoWithRating.jsx
│       ├── LandingPage.jsx
│       ├── Medilocker.jsx
│       ├── Pricing/
│       │   ├── App/
│       │   │   ├── ElitePlan.jsx
│       │   │   ├── ExecutivePlan.jsx
│       │   │   └── PlatinumPlan.jsx
│       │   └── MainPricing.jsx
│       ├── Settings.jsx
│       └── UserDashboard.jsx
│
└── utils/
    ├── AuthHandle.js
    ├── AuthService.js
    ├── ChatBotService.js
    ├── chatLimitManager.js
    ├── countryCodes.js
    ├── DoctorService.js
    ├── errorUtils.js
    ├── MedilockerService.js
    ├── Mixpanel.js
    ├── PaymentService.js
    ├── sessionManager.js
    └── TrackEvent.js
```

## Summary

- **Root Files**: Configuration files, entry points, and package management files
- **assets/**: Static assets including images, icons, and fonts
- **components/**: Reusable React components organized by feature
- **constants/**: Application constants and configuration
- **contexts/**: React Context providers for state management
- **hooks/**: Custom React hooks
- **navigation/**: Navigation configuration and routing
- **public/**: Public static files
- **scripts/**: Utility scripts
- **screens/**: Main application screens organized by user role (Doctor/Patient)
- **utils/**: Utility functions and service modules
