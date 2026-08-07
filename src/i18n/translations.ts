export type LangCode =
  | 'ar' | 'en' | 'fa' | 'tr' | 'ku' | 'fr' | 'de' | 'es' | 'it' | 'ru'
  | 'zh' | 'ja' | 'ko' | 'hi' | 'ur' | 'bn' | 'ms' | 'id' | 'th' | 'vi'
  | 'el' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'pl' | 'cs' | 'hu' | 'ro'
  | 'he' | 'sw';

export const RTL_LANGUAGES: LangCode[] = ['ar', 'fa', 'ku', 'he', 'ur'];

export const LANGUAGE_LIST: { code: LangCode; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ku', label: 'کوردی', flag: '🇮🇶' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
];

type TranslationKeys = {
  // General
  appName: string;
  settings: string;
  profile: string;
  chat: string;
  feed: string;
  notifications: string;
  language: string;
  languages: string;
  home: string;
  logout: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  search: string;
  send: string;
  back: string;
  more: string;
  loading: string;
  // Auth
  login: string;
  register: string;
  email: string;
  password: string;
  confirmPassword: string;
  loginWithGoogle: string;
  loginWithApple: string;
  welcomeTo: string;
  noAccount: string;
  haveAccount: string;
  createAccount: string;
  // Settings
  accountSettings: string;
  privacySecurity: string;
  notificationSettings: string;
  chatSettings: string;
  appearanceThemes: string;
  adminRoom: string;
  backup: string;
  darkMode: string;
  lightMode: string;
  mode: string;
  colors: string;
  enterAdminCode: string;
  secretCode: string;
  enter: string;
  // Chat
  typeMessage: string;
  newChat: string;
  beginner: string;
  intermediate: string;
  pro: string;
  fast: string;
  thinker: string;
  freeMessagesEnded: string;
  subscribeNow: string;
  uploadImage: string;
  uploadFile: string;
  addDescThenSend: string;
  // Feed
  writePost: string;
  whatsNew: string;
  publish: string;
  comments: string;
  writeComment: string;
  editPost: string;
  deletePost: string;
  noPostsYet: string;
  userId: string;
  copyId: string;
  // Profile
  name: string;
  bio: string;
  changePhoto: string;
  takePhoto: string;
  uploadPhoto: string;
  enterYourName: string;
  aboutYou: string;
  saveChanges: string;
  // Direct messages
  directMessages: string;
  searchByUserId: string;
  enterUserId: string;
  startChat: string;
  noChatsYet: string;
  searchUserToStart: string;
  addDescSend: string;
  writeMessage: string;
  // Notifications
  updatesNotifications: string;
  appUpdates: string;
  subscriptionPrices: string;
  // Privacy
  privacyPolicy: string;
  privacyContent: string;
  // Voice
  voiceNote: string;
  recording: string;
  // --- Extended (optional: falls back to English) ---
  developerStudio?: string;
  sadaLab?: string;
  codeEditor?: string;
  appBuilder?: string;
  runPreview?: string;
  close?: string;
  preview?: string;
  deleteChat?: string;
  deleteChatConfirm?: string;
  editMessage?: string;
  deleteMessage?: string;
  messageEdited?: string;
  editWindowOver?: string;
  reply?: string;
  confirm?: string;
  voiceCall?: string;
  calling?: string;
  incomingCall?: string;
  accept?: string;
  decline?: string;
  mute?: string;
  unmute?: string;
  speaker?: string;
  shareScreen?: string;
  endCall?: string;
  connecting?: string;
  connected?: string;
  callEnded?: string;
  navSettings?: string;
  navStudio?: string;
  navMessages?: string;
  navFeed?: string;
  navProfile?: string;
  navChat?: string;
};


const ar: TranslationKeys = {
  appName: 'صدى',
  settings: 'الاعدادات',
  profile: 'الملف الشخصي',
  chat: 'الدردشة',
  feed: 'المنشورات',
  notifications: 'الاشعارات',
  language: 'اللغة',
  languages: 'قائمة اللغات',
  home: 'الرئيسية',
  logout: 'تسجيل الخروج',
  cancel: 'إلغاء',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  search: 'بحث',
  send: 'إرسال',
  back: 'رجوع',
  more: 'المزيد',
  loading: 'جاري التحميل...',
  login: 'تسجيل الدخول',
  register: 'تسجيل',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  loginWithGoogle: 'الدخول عبر Google',
  loginWithApple: 'الدخول عبر Apple',
  welcomeTo: 'مرحباً بك في',
  noAccount: 'ليس لديك حساب؟',
  haveAccount: 'لديك حساب؟',
  createAccount: 'إنشاء حساب',
  accountSettings: 'اعدادات الحساب',
  privacySecurity: 'الخصوصية والأمان',
  notificationSettings: 'الاشعارات',
  chatSettings: 'اعدادات المحادثة',
  appearanceThemes: 'المظهر والثيمات',
  adminRoom: 'غرفة المدير',
  backup: 'نسخ احتياطي',
  darkMode: 'داكن',
  lightMode: 'فاتح',
  mode: 'الوضع',
  colors: 'الألوان',
  enterAdminCode: 'أدخل رمز المدير',
  secretCode: 'الرمز السري',
  enter: 'دخول',
  typeMessage: 'اكتب رسالتك...',
  newChat: 'محادثة جديدة',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  pro: 'محترف',
  fast: 'سريع',
  thinker: 'مفكر',
  freeMessagesEnded: 'انتهت الرسائل المجانية',
  subscribeNow: 'اشترك الآن',
  uploadImage: 'رفع صورة',
  uploadFile: 'رفع ملف',
  addDescThenSend: 'أضف نص وصفي ثم اضغط إرسال',
  writePost: 'اكتب منشوراً...',
  whatsNew: 'ما الجديد؟',
  publish: 'نشر',
  comments: 'التعليقات',
  writeComment: 'اكتب تعليقاً...',
  editPost: 'تعديل المنشور',
  deletePost: 'حذف المنشور',
  noPostsYet: 'لا توجد منشورات بعد',
  userId: 'معرف المستخدم',
  copyId: 'نسخ المعرف',
  name: 'الاسم',
  bio: 'النبذة',
  changePhoto: 'تغيير الصورة',
  takePhoto: 'التقاط صورة',
  uploadPhoto: 'رفع صورة',
  enterYourName: 'أدخل اسمك',
  aboutYou: 'نبذة عنك',
  saveChanges: 'حفظ التعديلات',
  directMessages: 'الرسائل الخاصة',
  searchByUserId: 'بحث بمعرف المستخدم',
  enterUserId: 'أدخل معرف المستخدم (ID)...',
  startChat: 'بدء محادثة',
  noChatsYet: 'لا توجد محادثات بعد',
  searchUserToStart: 'ابحث عن مستخدم بالمعرف لبدء محادثة',
  addDescSend: 'أضف وصف ثم أرسل',
  writeMessage: 'اكتب رسالة...',
  updatesNotifications: 'التحديثات والاشعارات',
  appUpdates: 'تحديثات التطبيق',
  subscriptionPrices: 'أسعار الاشتراكات',
  privacyPolicy: 'سياسة الخصوصية والأمان',
  privacyContent: `تطبيق صدى يلتزم بأعلى معايير الأمان والخصوصية لضمان حماية بيانات المستخدمين. يوفر نظام تسجيل دخول آمن يعتمد على كلمات مرور مشفرة لحماية حسابات المستخدمين. يتم تخزين جميع البيانات الشخصية بطريقة مشفرة باستخدام أحدث تقنيات التشفير لضمان عدم الوصول غير المصرح به. يتم الحفاظ على سرية جميع المعلومات الخاصة بالمستخدمين ولا يتم مشاركتها مع أي طرف ثالث بدون إذن واضح من المستخدم.

يسمح التطبيق للمستخدم بالتحكم الكامل في إعدادات الخصوصية مثل إخفاء الملف الشخصي أو إخفاء النشاطات. يوفر التطبيق ميزة تسجيل الخروج التلقائي بعد فترة من عدم النشاط لحماية الحساب. يدعم التطبيق المصادقة الثنائية لتوفير طبقة أمان إضافية. يسمح التطبيق بتغيير كلمة المرور في أي وقت مع إعلام المستخدم بأي تغييرات تطرأ على حسابه.

يستخدم التطبيق بروتوكولات HTTPS لتشفير جميع البيانات أثناء النقل. يتم فحص التطبيق بشكل دوري للتأكد من عدم وجود ثغرات أمنية. تُدار كلمات المرور بشكل آمن ومشفّر يمنع وصول أي جهة خارجية إليها. تتم حماية جميع الصور والملفات التي يرفعها المستخدم. يمكن للمستخدمين الإبلاغ عن أي نشاط مشبوه أو محتوى غير مناسب، ويعالج التطبيق هذه البلاغات بسرية وأمان. يتم تحديث نظام الأمان باستمرار لمواكبة أحدث التهديدات الإلكترونية.

يوفر التطبيق إشعارات لحظية حول أي نشاط غير عادي. يتم التحكم بالوصول إلى البيانات الحساسة بحيث يقتصر على الأشخاص المصرح لهم فقط. جميع عمليات الدفع والمعاملات المالية محمية باستخدام تشفير قوي. يتم تسجيل الدخول من الأجهزة الجديدة بموافقة المستخدم لضمان الأمان. يمنح التطبيق للمستخدم القدرة على مراجعة وتعديل المعلومات الشخصية في أي وقت. يتم تخزين جميع سجلات النشاطات بشكل آمن لتتبع أي استخدام مشبوه دون المساس بالخصوصية.

يتم حماية البيانات من الهجمات الخارجية مثل الاختراقات أو محاولات الوصول غير المصرح به. يوفر التطبيق ميزة الحماية من هجمات التصيد الاحتيالي ويتم فحص الروابط والملفات المرفقة لضمان الأمان. يتم التأكد من تحديث جميع مكونات التطبيق بانتظام. يوفر التطبيق تعليمات واضحة حول حماية الحسابات. يمنع التطبيق تخزين كلمات المرور بشكل نص عادي. يحافظ التطبيق على سرية المحادثات والرسائل دون أي تدخل خارجي.

تتم مراقبة الأنشطة المشبوهة على المنصة بشكل مستمر. يمنح التطبيق إمكانية تفعيل وإيقاف مشاركة الموقع الجغرافي بشكل كامل. يتيح التطبيق للمستخدم التحكم في من يمكنه رؤية ملفه الشخصي. يوفر التطبيق نسخ احتياطية مشفرة للبيانات. يتم فحص التطبيق باستمرار من قبل خبراء الأمن. تتم حماية قواعد البيانات باستخدام طبقات متعددة من الأمان. يوفر التطبيق تعليمات واضحة حول كيفية التعامل مع محاولات الاحتيال الإلكتروني.

يتم تشفير جميع المحادثات والمرفقات. يتم إخطار المستخدم فور حدوث أي تغييرات على إعدادات الأمان. يتم التحكم بإمكانية مشاركة البيانات مع أطراف ثالثة بشكل صارم. تتم مراقبة أي محاولات تسجيل دخول غير مصرح بها. يوفر التطبيق آليات لإعادة تعيين كلمة المرور بأمان. يتم تشفير جميع الرسائل والملفات. تتم حماية الوصول إلى الحساب من خلال جلسات مؤقتة تنتهي بعد وقت محدد.

يتم تسجيل جميع محاولات الدخول غير الناجحة وتحليلها. يوفر التطبيق إشعارات حول الأنشطة غير المعتادة. تتم حماية جميع مكونات التطبيق من التلاعب. يتم تشفير جميع بيانات الموقع الجغرافي. يتم تحديث نظام الأمان تلقائياً. يتم التحكم بالوصول إلى المعلومات الحساسة. يوفر التطبيق حماية كاملة للبيانات المالية. يتم تقديم تعليمات واضحة حول الاستخدام الآمن. يتم منع تخزين البيانات في أماكن غير آمنة.

تتم مراقبة محاولات الوصول غير المصرح بها. يتم إخطار المستخدم بأي نشاط غير عادي. يتم إدارة جميع الصلاحيات من قبل المسؤولين المصرح لهم فقط. يوفر التطبيق نظام تنبيهات للتهديدات. يتم تشفير كلمات المرور بتقنيات حديثة. يُمنع الوصول من الأجهزة غير المعروفة. تُراقب التغييرات على إعدادات الأمان. تُحمى الصور والملفات بتشفير تام. يُمنع مشاركة البيانات بدون موافقة صريحة. تُحدّث بروتوكولات الأمان بانتظام.

تُقدم تعليمات للتعامل مع البريد المشبوه. تُراقب الأنشطة لمنع الهجمات. تتوفر آليات لاستعادة الحسابات. تُفحص الروابط والمرفقات قبل عرضها. تُقيد مشاركة المعلومات الحساسة. تُرسل إشعارات فورية عند محاولات الدخول غير المصرح بها. يُفحص التطبيق لاكتشاف الثغرات. تُقدم إرشادات لحماية الحساب. تتوفر حماية من البرمجيات الضارة. تُدار الصلاحيات بدقة. تُقدم تعليمات لحماية المعلومات الدائمة.

تُحمى سجلات النشاطات من التلاعب. تُراقب عمليات الدفع بصرامة. تتوفر إشعارات للنشاط غير المعتاد. يُتحكم في مشاركة الموقع لضمان الخصوصية. تُحمى المحادثات والملفات. تُحدّث أنظمة الأمان باستمرار. تُقدم تعليمات لاستخدام كلمات مرور قوية. تُدار الجلسات لتنتهي تلقائياً. تُراقب محاولات الوصول الفورية. تُحمى مكونات التطبيق من التعديلات. يُخطر المستخدم بتغييرات الخصوصية. ويوفر التطبيق التحكم الكامل في إعدادات الخصوصية والأمان لضمان تجربة استخدام آمنة ومريحة.`,
  voiceNote: 'رسالة صوتية',
  recording: 'جاري التسجيل...',
};

const en: TranslationKeys = {
  appName: 'Sada',
  settings: 'Settings',
  profile: 'Profile',
  chat: 'Chat',
  feed: 'Feed',
  notifications: 'Notifications',
  language: 'Language',
  languages: 'Languages',
  home: 'Home',
  logout: 'Logout',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  search: 'Search',
  send: 'Send',
  back: 'Back',
  more: 'More',
  loading: 'Loading...',
  login: 'Login',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  loginWithGoogle: 'Sign in with Google',
  loginWithApple: 'Sign in with Apple',
  welcomeTo: 'Welcome to',
  noAccount: "Don't have an account?",
  haveAccount: 'Already have an account?',
  createAccount: 'Create Account',
  accountSettings: 'Account Settings',
  privacySecurity: 'Privacy & Security',
  notificationSettings: 'Notifications',
  chatSettings: 'Chat Settings',
  appearanceThemes: 'Appearance & Themes',
  adminRoom: 'Admin Room',
  backup: 'Backup',
  darkMode: 'Dark',
  lightMode: 'Light',
  mode: 'Mode',
  colors: 'Colors',
  enterAdminCode: 'Enter Admin Code',
  secretCode: 'Secret Code',
  enter: 'Enter',
  typeMessage: 'Type your message...',
  newChat: 'New Chat',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  pro: 'Pro',
  fast: 'Fast',
  thinker: 'Thinker',
  freeMessagesEnded: 'Free messages ended',
  subscribeNow: 'Subscribe Now',
  uploadImage: 'Upload Image',
  uploadFile: 'Upload File',
  addDescThenSend: 'Add description then press send',
  writePost: 'Write a post...',
  whatsNew: "What's new?",
  publish: 'Publish',
  comments: 'Comments',
  writeComment: 'Write a comment...',
  editPost: 'Edit Post',
  deletePost: 'Delete Post',
  noPostsYet: 'No posts yet',
  userId: 'User ID',
  copyId: 'Copy ID',
  name: 'Name',
  bio: 'Bio',
  changePhoto: 'Change Photo',
  takePhoto: 'Take Photo',
  uploadPhoto: 'Upload Photo',
  enterYourName: 'Enter your name',
  aboutYou: 'About you',
  saveChanges: 'Save Changes',
  directMessages: 'Direct Messages',
  searchByUserId: 'Search by User ID',
  enterUserId: 'Enter User ID...',
  startChat: 'Start Chat',
  noChatsYet: 'No chats yet',
  searchUserToStart: 'Search for a user by ID to start chatting',
  addDescSend: 'Add description then send',
  writeMessage: 'Write a message...',
  updatesNotifications: 'Updates & Notifications',
  appUpdates: 'App Updates',
  subscriptionPrices: 'Subscription Prices',
  privacyPolicy: 'Privacy & Security Policy',
  privacyContent: 'Sada app is committed to the highest standards of security and privacy to ensure user data protection. It provides a secure login system based on encrypted passwords. All personal data is stored using the latest encryption technologies. User information is kept confidential and is not shared with third parties without explicit user consent.',
  voiceNote: 'Voice Note',
  recording: 'Recording...',
};

const fr: TranslationKeys = {
  appName: 'Sada', settings: 'Paramètres', profile: 'Profil', chat: 'Discussion', feed: 'Publications', notifications: 'Notifications', language: 'Langue', languages: 'Langues', home: 'Accueil', logout: 'Déconnexion', cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer', edit: 'Modifier', search: 'Rechercher', send: 'Envoyer', back: 'Retour', more: 'Plus', loading: 'Chargement...', login: 'Connexion', register: "S'inscrire", email: 'E-mail', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe', loginWithGoogle: 'Se connecter avec Google', loginWithApple: 'Se connecter avec Apple', welcomeTo: 'Bienvenue à', noAccount: "Pas de compte ?", haveAccount: 'Vous avez un compte ?', createAccount: 'Créer un compte', accountSettings: 'Paramètres du compte', privacySecurity: 'Confidentialité et sécurité', notificationSettings: 'Notifications', chatSettings: 'Paramètres de discussion', appearanceThemes: 'Apparence et thèmes', adminRoom: 'Salle admin', backup: 'Sauvegarde', darkMode: 'Sombre', lightMode: 'Clair', mode: 'Mode', colors: 'Couleurs', enterAdminCode: "Entrez le code admin", secretCode: 'Code secret', enter: 'Entrer', typeMessage: 'Tapez votre message...', newChat: 'Nouvelle discussion', beginner: 'Débutant', intermediate: 'Intermédiaire', pro: 'Pro', fast: 'Rapide', thinker: 'Penseur', freeMessagesEnded: 'Messages gratuits épuisés', subscribeNow: "S'abonner", uploadImage: 'Télécharger une image', uploadFile: 'Télécharger un fichier', addDescThenSend: 'Ajoutez une description puis envoyez', writePost: 'Écrire un post...', whatsNew: 'Quoi de neuf ?', publish: 'Publier', comments: 'Commentaires', writeComment: 'Écrire un commentaire...', editPost: 'Modifier le post', deletePost: 'Supprimer le post', noPostsYet: 'Aucun post pour le moment', userId: 'ID utilisateur', copyId: "Copier l'ID", name: 'Nom', bio: 'Bio', changePhoto: 'Changer la photo', takePhoto: 'Prendre une photo', uploadPhoto: 'Télécharger une photo', enterYourName: 'Entrez votre nom', aboutYou: 'À propos de vous', saveChanges: 'Enregistrer les modifications', directMessages: 'Messages directs', searchByUserId: "Rechercher par ID d'utilisateur", enterUserId: "Entrez l'ID utilisateur...", startChat: 'Démarrer la discussion', noChatsYet: 'Aucune discussion pour le moment', searchUserToStart: "Recherchez un utilisateur par ID pour commencer", addDescSend: 'Ajoutez une description puis envoyez', writeMessage: 'Écrire un message...', updatesNotifications: 'Mises à jour et notifications', appUpdates: "Mises à jour de l'app", subscriptionPrices: "Tarifs d'abonnement", privacyPolicy: 'Politique de confidentialité et de sécurité', privacyContent: "L'application Sada s'engage aux normes les plus élevées de sécurité et de confidentialité pour protéger les données des utilisateurs.", voiceNote: 'Note vocale', recording: 'Enregistrement...',
};

// For brevity, other languages use English as fallback with their specific app name
const createLang = (overrides: Partial<TranslationKeys>): TranslationKeys => ({ ...en, ...overrides });

const translations: Record<LangCode, TranslationKeys> = {
  ar,
  en,
  fr,
  fa: createLang({ appName: 'صدا', settings: 'تنظیمات', profile: 'پروفایل', chat: 'گفتگو', feed: 'پست‌ها', notifications: 'اعلان‌ها', language: 'زبان', languages: 'زبان‌ها', home: 'خانه', logout: 'خروج', login: 'ورود', register: 'ثبت‌نام', email: 'ایمیل', password: 'رمز عبور', typeMessage: 'پیام خود را بنویسید...', send: 'ارسال', search: 'جستجو' }),
  tr: createLang({ settings: 'Ayarlar', profile: 'Profil', chat: 'Sohbet', feed: 'Gönderi', notifications: 'Bildirimler', language: 'Dil', languages: 'Diller', home: 'Ana Sayfa', logout: 'Çıkış', login: 'Giriş', register: 'Kayıt', typeMessage: 'Mesajınızı yazın...', send: 'Gönder', search: 'Ara' }),
  ku: createLang({ settings: 'ڕێکخستنەکان', profile: 'پڕۆفایل', chat: 'چات', feed: 'بابەتەکان', notifications: 'ئاگاداریەکان', language: 'زمان', languages: 'زمانەکان', home: 'سەرەکی', logout: 'دەرچوون', login: 'چوونەژوورەوە' }),
  de: createLang({ settings: 'Einstellungen', profile: 'Profil', chat: 'Chat', feed: 'Beiträge', notifications: 'Benachrichtigungen', language: 'Sprache', languages: 'Sprachen', home: 'Startseite', logout: 'Abmelden', login: 'Anmelden', register: 'Registrieren', typeMessage: 'Nachricht eingeben...', send: 'Senden', search: 'Suchen' }),
  es: createLang({ settings: 'Configuración', profile: 'Perfil', chat: 'Chat', feed: 'Publicaciones', notifications: 'Notificaciones', language: 'Idioma', languages: 'Idiomas', home: 'Inicio', logout: 'Cerrar sesión', login: 'Iniciar sesión', register: 'Registrarse', typeMessage: 'Escribe tu mensaje...', send: 'Enviar', search: 'Buscar' }),
  it: createLang({ settings: 'Impostazioni', profile: 'Profilo', chat: 'Chat', feed: 'Post', notifications: 'Notifiche', language: 'Lingua', languages: 'Lingue', home: 'Home', logout: 'Esci', login: 'Accedi', register: 'Registrati', typeMessage: 'Scrivi un messaggio...', send: 'Invia', search: 'Cerca' }),
  ru: createLang({ settings: 'Настройки', profile: 'Профиль', chat: 'Чат', feed: 'Лента', notifications: 'Уведомления', language: 'Язык', languages: 'Языки', home: 'Главная', logout: 'Выход', login: 'Вход', register: 'Регистрация', typeMessage: 'Введите сообщение...', send: 'Отправить', search: 'Поиск' }),
  zh: createLang({ settings: '设置', profile: '个人资料', chat: '聊天', feed: '动态', notifications: '通知', language: '语言', languages: '语言列表', home: '首页', logout: '退出', login: '登录', register: '注册', typeMessage: '输入消息...', send: '发送', search: '搜索' }),
  ja: createLang({ settings: '設定', profile: 'プロフィール', chat: 'チャット', feed: 'フィード', notifications: '通知', language: '言語', languages: '言語一覧', home: 'ホーム', logout: 'ログアウト', login: 'ログイン', register: '登録', typeMessage: 'メッセージを入力...', send: '送信', search: '検索' }),
  ko: createLang({ settings: '설정', profile: '프로필', chat: '채팅', feed: '피드', notifications: '알림', language: '언어', languages: '언어 목록', home: '홈', logout: '로그아웃', login: '로그인', register: '회원가입', typeMessage: '메시지를 입력하세요...', send: '보내기', search: '검색' }),
  hi: createLang({ settings: 'सेटिंग्स', profile: 'प्रोफ़ाइल', chat: 'चैट', feed: 'फ़ीड', notifications: 'सूचनाएं', language: 'भाषा', languages: 'भाषाएं', home: 'होम', logout: 'लॉगआउट', login: 'लॉगिन', register: 'रजिस्टर', typeMessage: 'अपना संदेश लिखें...', send: 'भेजें', search: 'खोज' }),
  ur: createLang({ settings: 'ترتیبات', profile: 'پروفائل', chat: 'چیٹ', feed: 'فیڈ', notifications: 'اطلاعات', language: 'زبان', languages: 'زبانیں', home: 'ہوم', logout: 'لاگ آؤٹ', login: 'لاگ ان', register: 'رجسٹر', typeMessage: 'اپنا پیغام لکھیں...', send: 'بھیجیں', search: 'تلاش' }),
  bn: createLang({ settings: 'সেটিংস', profile: 'প্রোফাইল', chat: 'চ্যাট', feed: 'ফিড', notifications: 'বিজ্ঞপ্তি', language: 'ভাষা', home: 'হোম', logout: 'লগআউট', login: 'লগইন' }),
  ms: createLang({ settings: 'Tetapan', profile: 'Profil', chat: 'Sembang', feed: 'Suapan', notifications: 'Pemberitahuan', language: 'Bahasa', home: 'Laman Utama', logout: 'Log Keluar', login: 'Log Masuk' }),
  id: createLang({ settings: 'Pengaturan', profile: 'Profil', chat: 'Obrolan', feed: 'Beranda', notifications: 'Notifikasi', language: 'Bahasa', home: 'Beranda', logout: 'Keluar', login: 'Masuk' }),
  th: createLang({ settings: 'การตั้งค่า', profile: 'โปรไฟล์', chat: 'แชท', feed: 'ฟีด', notifications: 'การแจ้งเตือน', language: 'ภาษา', home: 'หน้าแรก', logout: 'ออกจากระบบ', login: 'เข้าสู่ระบบ' }),
  vi: createLang({ settings: 'Cài đặt', profile: 'Hồ sơ', chat: 'Trò chuyện', feed: 'Bảng tin', notifications: 'Thông báo', language: 'Ngôn ngữ', home: 'Trang chủ', logout: 'Đăng xuất', login: 'Đăng nhập' }),
  el: createLang({ settings: 'Ρυθμίσεις', profile: 'Προφίλ', chat: 'Συνομιλία', feed: 'Ροή', notifications: 'Ειδοποιήσεις', language: 'Γλώσσα', home: 'Αρχική', logout: 'Αποσύνδεση', login: 'Σύνδεση' }),
  nl: createLang({ settings: 'Instellingen', profile: 'Profiel', chat: 'Chat', feed: 'Feed', notifications: 'Meldingen', language: 'Taal', home: 'Home', logout: 'Uitloggen', login: 'Inloggen' }),
  sv: createLang({ settings: 'Inställningar', profile: 'Profil', chat: 'Chatt', feed: 'Flöde', notifications: 'Notiser', language: 'Språk', home: 'Hem', logout: 'Logga ut', login: 'Logga in' }),
  da: createLang({ settings: 'Indstillinger', profile: 'Profil', chat: 'Chat', feed: 'Feed', notifications: 'Notifikationer', language: 'Sprog', home: 'Hjem', logout: 'Log ud', login: 'Log ind' }),
  no: createLang({ settings: 'Innstillinger', profile: 'Profil', chat: 'Chat', feed: 'Strøm', notifications: 'Varsler', language: 'Språk', home: 'Hjem', logout: 'Logg ut', login: 'Logg inn' }),
  fi: createLang({ settings: 'Asetukset', profile: 'Profiili', chat: 'Keskustelu', feed: 'Syöte', notifications: 'Ilmoitukset', language: 'Kieli', home: 'Koti', logout: 'Kirjaudu ulos', login: 'Kirjaudu sisään' }),
  pl: createLang({ settings: 'Ustawienia', profile: 'Profil', chat: 'Czat', feed: 'Aktualności', notifications: 'Powiadomienia', language: 'Język', home: 'Strona główna', logout: 'Wyloguj', login: 'Zaloguj' }),
  cs: createLang({ settings: 'Nastavení', profile: 'Profil', chat: 'Chat', feed: 'Příspěvky', notifications: 'Oznámení', language: 'Jazyk', home: 'Domů', logout: 'Odhlásit', login: 'Přihlásit' }),
  hu: createLang({ settings: 'Beállítások', profile: 'Profil', chat: 'Csevegés', feed: 'Hírfolyam', notifications: 'Értesítések', language: 'Nyelv', home: 'Kezdőlap', logout: 'Kijelentkezés', login: 'Bejelentkezés' }),
  ro: createLang({ settings: 'Setări', profile: 'Profil', chat: 'Chat', feed: 'Flux', notifications: 'Notificări', language: 'Limbă', home: 'Acasă', logout: 'Deconectare', login: 'Conectare' }),
  he: createLang({ settings: 'הגדרות', profile: 'פרופיל', chat: "צ'אט", feed: 'פיד', notifications: 'התראות', language: 'שפה', home: 'בית', logout: 'התנתק', login: 'התחבר' }),
  sw: createLang({ settings: 'Mipangilio', profile: 'Wasifu', chat: 'Mazungumzo', feed: 'Habari', notifications: 'Arifa', language: 'Lugha', home: 'Nyumbani', logout: 'Ondoka', login: 'Ingia' }),
};

export const t = (lang: LangCode, key: keyof TranslationKeys): string => {
  return translations[lang]?.[key] || translations.ar[key] || key;
};

export const isRTL = (lang: LangCode): boolean => RTL_LANGUAGES.includes(lang);

export default translations;
