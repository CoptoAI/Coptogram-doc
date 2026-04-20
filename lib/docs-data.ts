export interface DocSection {
  id: string;
  title: string;
  category: 'organization' | 'student' | 'general';
  icon?: string;
  content: string;
  items?: DocItem[];
  tags?: string[];
  translations?: {
    ar: {
      title: string;
      content: string;
      tags?: string[];
    }
  }
}

export interface RelatedLink {
  title: string;
  sectionId: string;
  itemId?: string;
}

export interface DocItem {
  id: string;
  title: string;
  description: string;
  details?: string[];
  version?: string;
  code?: string;
  tags?: string[];
  relatedLinks?: RelatedLink[];
  translations?: {
    ar: {
      title: string;
      description: string;
      details?: string[];
      tags?: string[];
      relatedLinks?: { title: string }[];
    }
  }
}

export const docs: DocSection[] = [
  {
    id: 'overview',
    title: 'Welcome to Coptogram',
    category: 'general',
    icon: 'Sparkles',
    content: 'Coptogram is a modern Christian learning platform that makes spiritual knowledge simple, practical, and easy to understand. This documentation provides a comprehensive guide for both Organizations (Churches/Dioceses) and Students.',
    tags: ['Introduction', 'Overview', 'Mission'],
    translations: {
      ar: {
        title: 'مرحباً بكم في كوبتوجرام',
        content: 'كوبتوجرام هي منصة تعليمية مسيحية حديثة تجعل المعرفة الروحية بسيطة وعملية وسهلة الفهم. يوفر هذا المستند دليلاً شاملاً لكل من المنظمات (الكنائس/الإيبارشيات) والطلاب.',
        tags: ['مقدمة', 'نظرة عامة', 'المهمة']
      }
    },
    items: [
      {
        id: 'centralized-hub',
        title: 'Platform Overview',
        description: 'Learn about the core philosophy of Coptogram as a centralized hub for digital discipleship.',
        tags: ['Core Philosophy', 'Digital Discipleship'],
        translations: {
          ar: {
            title: 'نظرة عامة على المنصة',
            description: 'تعرف على الفلسفة الأساسية لكوبتوجرام كمركز مركزي للتلمذة الرقمية.',
            tags: ['الفلسفة الأساسية', 'التلمذة الرقمية']
          }
        }
      }
    ]
  },
  {
    id: 'org-getting-started',
    title: 'Getting Started for Organizations',
    category: 'organization',
    icon: 'Church',
    content: 'Learn how to set up your Church or Diocese on the Coptogram platform and prepare for your first course rollout.',
    tags: ['Setup', 'Onboarding', 'Admin'],
    translations: {
      ar: {
        title: 'البدء للمنظمات',
        content: 'تعرف على كيفية إعداد كنيستك أو إيبارشيتك على منصة كوبتوجرام والاستعداد لإطلاق دورتك التعليمية الأولى.',
        tags: ['إعداد', 'التوطين', 'مسؤول']
      }
    },
    items: [
      {
        id: 'account-setup',
        title: 'Initial Account Setup',
        description: 'Step-by-step guide to configuring your organizational profile and branding.',
        tags: ['Branding', 'Profile', 'Configuration'],
        relatedLinks: [
          { title: 'User Roles', sectionId: 'user-roles' },
          { title: 'Monetization Basics', sectionId: 'org-monetization' }
        ],
        translations: {
          ar: {
            title: 'إعداد الحساب الأولي',
            description: 'دليل تدريجي لتكوين ملفك الشخصي التنظيمي وعلامتك التجارية.',
            relatedLinks: [
              { title: 'أدوار المستخدمين' },
              { title: 'أساسيات تسييل الموارد' }
            ]
          }
        }
      },
      {
        id: 'instructor-management',
        title: 'Instructor Roles',
        description: 'How to invite Priests, Pastors, and Servants to contribute content.',
        relatedLinks: [
          { title: 'Instructor Permissions', sectionId: 'user-roles', itemId: 'instructor-role' },
          { title: 'Platform Admin', sectionId: 'user-roles', itemId: 'admin-role' }
        ],
        translations: {
          ar: {
            title: 'أدوار المحاضرين',
            description: 'كيفية دعوة الآباء الكهنة والخدام للمساهمة بالمحتوى.',
            relatedLinks: [
              { title: 'أذونات المحاضر' },
              { title: 'مسؤول المنصة' }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'org-course-creation',
    title: 'Course Management (LMS)',
    category: 'organization',
    icon: 'Library',
    content: 'Deep dive into creating and managing your e-learning content.',
    tags: ['LMS', 'e-Learning', 'Pedagogy'],
    translations: {
      ar: {
        title: 'إدارة الدورات (نظام إدارة التعلم)',
        content: 'تعمق في إنشاء وإدارة محتوى التعلم الإلكتروني الخاص بك.',
        tags: ['نظام إدارة التعلم', 'التعلم الإلكتروني', 'البيداغوجيا']
      }
    },
    items: [
      {
        id: 'text-courses',
        title: 'Creating Text Courses',
        description: 'How to build engaging text and video-based modules.',
        tags: ['Text-Based', 'Video', 'Modules'],
        translations: {
          ar: {
            title: 'إنشاء دورات نصية',
            description: 'كيفية بناء وحدات جذابة تعتمد على النصوص والفيديو.',
            tags: ['مبني على النص', 'فيديو', 'وحدات']
          }
        }
      },
      {
        id: 'scorm-import',
        title: 'SCORM & Interactive Content',
        description: 'Importing advanced e-learning files from external authoring tools.',
        version: 'v1.5',
        tags: ['SCORM', 'Interactivity', 'Imports'],
        translations: {
          ar: {
            title: 'SCORM والمحتوى التفاعلي',
            description: 'استيراد ملفات التعلم الإلكتروني المتقدمة من أدوات التأليف الخارجية.',
            tags: ['سكورم', 'تفاعل', 'استيراد']
          }
        }
      }
    ]
  },
  {
    id: 'org-monetization',
    title: 'Monetization & Finances',
    category: 'organization',
    icon: 'Banknote',
    content: 'Configure how you want to handle donations or course fees for your ministry.',
    translations: {
      ar: {
        title: 'تسييل الموارد والتمويل',
        content: 'قم بتكوين الطريقة التي تريد بها التعامل مع التبرعات أو رسوم الدورات لخدمتك.'
      }
    },
    items: [
      {
        id: 'gateways',
        title: 'Setting up Payment Gateways',
        description: 'Configuring Stripe, PayPal, and 30+ other global partners.',
        relatedLinks: [
          { title: 'Subscription Models', sectionId: 'org-monetization', itemId: 'subscriptions' }
        ],
        translations: {
          ar: {
            title: 'إعداد بوابات الدفع',
            description: 'تكوين Stripe وPayPal وأكثر من 30 شريكاً عالمياً آخر.',
            relatedLinks: [
              { title: 'نماذج الاشتراك' }
            ]
          }
        }
      },
      {
        id: 'subscriptions',
        title: 'Subscription Plans',
        description: 'Setting up recurring support models for your students.',
        translations: {
          ar: {
            title: 'خطط الاشتراك',
            description: 'إعداد نماذج دعم متكررة لطلابك.'
          }
        }
      }
    ]
  },
  {
    id: 'student-experience',
    title: 'Student Learning Guide',
    category: 'student',
    icon: 'GraduationCap',
    content: 'Everything a searcher or student needs to know about using the platform to grow spiritually.',
    translations: {
      ar: {
        title: 'دليل تعلم الطالب',
        content: 'كل ما يحتاجه الباحث أو الطالب معرفته حول استخدام المنصة للنمو روحياً.'
      }
    },
    items: [
      {
        id: 'finding-courses',
        title: 'Finding Spiritual Content',
        description: 'How to use the course catalog and filter by ministry or topic.',
        relatedLinks: [
          { title: 'Student Learning Path', sectionId: 'student-experience', itemId: 'learning-path' }
        ],
        translations: {
          ar: {
            title: 'البحث عن محتوى روحي',
            description: 'كيفية استخدام دليل الدورات والتصفية حسب الخدمة أو الموضوع.',
            relatedLinks: [
              { title: 'مسار تعلم الطالب' }
            ]
          }
        }
      },
      {
        id: 'learning-path',
        title: 'Your Personal Learning Path',
        description: 'Tracking progress and continuing where you left off.',
        translations: {
          ar: {
            title: 'مسار تعلمك الشخصي',
            description: 'تتبع التقدم والمتابعة من حيث توقفت.'
          }
        }
      }
    ]
  },
  {
    id: 'student-gamification',
    title: 'Quizzes & Certificates',
    category: 'student',
    icon: 'Medal',
    content: 'How the validation and rewards system works for students.',
    tags: ['Gamification', 'Engagement', 'Rewards'],
    translations: {
      ar: {
        title: 'الاختبارات والشهادات',
        content: 'كيف يعمل نظام التحقق والمكافآت للطلاب.',
        tags: ['التلعيب', 'التفاعل', 'المكافآت']
      }
    },
    items: [
      {
        id: 'taking-quizzes',
        title: 'Quizzes & Testing',
        description: 'How to complete assessments and earn certificates.',
        tags: ['Testing', 'Assessment', 'Certification'],
        relatedLinks: [
          { title: 'Certificates Guide', sectionId: 'student-gamification', itemId: 'reward-points' }
        ],
        translations: {
          ar: {
            title: 'الاختبارات والتقييم',
            description: 'كيفية إكمال التقييمات والحصول على الشهادات.',
            tags: ['اختبار', 'تقييم', 'شهادات'],
            relatedLinks: [
              { title: 'دليل الشهادات' }
            ]
          }
        }
      },
      {
        id: 'reward-points',
        title: 'Coptogram Rewards',
        description: 'Earning points for consistent spiritual study and redemption.',
        version: 'v1.5',
        tags: ['Points', 'Redemption', 'Economy'],
        translations: {
          ar: {
            title: 'مكافآت كوبتوجرام',
            description: 'كسب النقاط مقابل الدراسة الروحية المستمرة واستبدالها.',
            tags: ['نقاط', 'استرداد', 'اقتصاد']
          }
        }
      }
    ]
  },
  {
    id: 'live-sessions',
    title: 'Live Classes & Meetings',
    category: 'general',
    icon: 'Radio',
    content: 'How to participate in synchronous live teachings and book one-on-one sessions.',
    translations: {
      ar: {
        title: 'الفصول المباشرة والاجتماعات',
        content: 'كيفية المشاركة في الدروس الروحية المباشرة وحجز جلسات فردية.'
      }
    },
    items: [
      {
        id: 'agora-live',
        title: 'In-App Live Classes',
        description: 'Joining live sessions directly from your dashboard.',
        translations: {
          ar: {
            title: 'فصول مباشرة داخل التطبيق',
            description: 'الانضمام إلى الجلسات المباشرة مباشرة من لوحة التحكم الخاصة بك.'
          }
        }
      },
      {
        id: 'booking',
        title: 'Booking with Servants',
        description: 'Scheduling one-on-one spiritual guidance meetings.',
        translations: {
          ar: {
            title: 'الحجز مع الخدام',
            description: 'جدولة اجتماعات الإرشاد الروحي الفردية.'
          }
        }
      }
    ]
  },
  {
    id: 'community-forum',
    title: 'Community & Forum',
    category: 'general',
    icon: 'Users',
    content: 'Engaging with other believers and instructors in a safe community environment.',
    tags: ['Community', 'Forum', 'Interaction'],
    translations: {
      ar: {
        title: 'المجتمع والمنتدى',
        content: 'التفاعل مع المؤمنين الآخرين والمحاضرين في بيئة مجتمعية آمنة.',
        tags: ['المجتمع', 'المنتدى', 'التفاعل']
      }
    },
    items: [
      {
        id: 'forum-participation',
        title: 'Using the Community Boards',
        description: 'Posting questions and participating in discussions.',
        tags: ['Discussions', 'Q&A', 'Boards'],
        translations: {
          ar: {
            title: 'استخدام لوحات المجتمع',
            description: 'نشر الأسئلة والمشاركة في المناقشات.',
            tags: ['نقاشات', 'سؤال وجواب', 'لوحات']
          }
        }
      }
    ]
  },
  {
    id: 'user-roles',
    title: 'User Roles & Permissions',
    category: 'general',
    icon: 'Fingerprint',
    content: 'Coptogram uses a sophisticated Role-Based Access Control (RBAC) system to ensure everyone has the exact tools they need for their specific part in the ministry.',
    tags: ['Security', 'RBAC', 'Permissions'],
    translations: {
      ar: {
        title: 'أدوار المستخدمين والأذونات',
        content: 'يستخدم كوبتوجرام نظاماً متطوراً للتحكم في الوصول القائم على الأدوار (RBAC) لضمان حصول الجميع على الأدوات الدقيقة التي يحتاجونها لدورهم المحدد في الخدمة.',
        tags: ['الأمان', 'التحكم في الوصول', 'الأذونات']
      }
    },
    items: [
      {
        id: 'org-owner',
        title: 'Organization Owner',
        description: 'The highest set of permissions, typically held by a Bishop, Parish Priest, or Senior Leader.',
        translations: {
          ar: {
            title: 'مالك المنظمة',
            description: 'أعلى مجموعة من الأذونات، عادة ما تكون لأسقف أو كاهن كنيسة أو قائد كبير.',
            details: [
              'تحكم كامل في العلامة التجارية للمنصة والنطاقات المخصصة.',
              'إدارة الفواتير وخطط الاشتراك وإعدادات الدفع.',
              'القدرة على حذف أو أرشفة مثيل المنظمة بالكامل.',
              'يمكن منح/إلغاء وضع المسؤول للمستخدمين الآخرين.'
            ]
          }
        },
        details: [
          'Full control over platform branding and custom domains.',
          'Management of billing, subscription plans, and payout settings.',
          'Ability to delete or archive the entire organization instance.',
          'Can grant/revoke Administrator status to other users.'
        ]
      },
      {
        id: 'admin-role',
        title: 'Platform Administrator',
        description: 'The day-to-day operators of the Coptogram instance.',
        translations: {
          ar: {
            title: 'مسؤول المنصة',
            description: 'المشغلون اليوميون لمثيل كوبتوجرام.',
            details: [
              'التحقق من طلبات المحاضرين الجدد والموافقة عليها.',
              'مراقبة التحليلات وتقارير التمويل على مستوى المنصة.',
              'الوصول إلى نظام استرداد السلة المهجورة.',
              'الإشراف على منشورات المنتدى ومناقشات المجتمع.'
            ]
          }
        },
        details: [
          'Verify and approve new instructor applications.',
          'Monitor platform-wide analytics and financial reports.',
          'Access to the abandoned cart recovery system.',
          'Moderate forum posts and community discussions.'
        ]
      },
      {
        id: 'instructor-role',
        title: 'Course Instructor',
        description: 'The teaching staff, including Priests, Servants, and Scholars.',
        translations: {
          ar: {
            title: 'محاضر الدورة',
            description: 'هيئة التدريس، بما في ذلك الكهنة والخدام والباحثون.',
            details: [
              'إنشاء ونشر الدورات (نص، فيديو، أو SCORM).',
              'إدارة تسجيلات الطلاب ونتائج الاختبارات لدوراتهم الخاصة.',
              'استضافة الجلسات المباشرة وتقويمات الحجز الفردية.',
              'الرد على تذاكر الدعم والتعليقات على محتواهم.'
            ]
          }
        },
        details: [
          'Create and publish Courses (Text, Video, or SCORM).',
          'Manage student enrollments and quiz results for their own courses.',
          'Host live sessions and one-on-one booking calendars.',
          'Respond to support tickets and comments on their content.'
        ]
      },
      {
        id: 'student-role',
        title: 'Student / Disciple',
        description: 'The end-users engaging with the spiritual content.',
        translations: {
          ar: {
            title: 'طالب / تلميذ',
            description: 'المستخدمون النهائيون الذين يتفاعلون مع المحتوى الروحي.',
            details: [
              'التسجيل في دورات مجانية أو مدفوعة من الكتالوج.',
              'تتبع التقدم والحصول على شهادات معتمدة.',
              'المشاركة في لوحات المجتمع والجلسات المباشرة.',
              'كسب واستبدال نقاط مكافآت كوبتوجرام.'
            ]
          }
        },
        details: [
          'Enrolling in free or paid courses from the catalog.',
          'Tracking progress and earning verified certificates.',
          'Participating in community boards and participating in live sessions.',
          'Earn and redeem Coptogram rewards points.'
        ]
      }
    ]
  },
  {
    id: 'rich-content',
    title: 'Rich Content & Authoring',
    category: 'general',
    icon: 'PenTool',
    content: `Coptogram supports advanced content authoring using **Markdown**, **GFM (GitHub Flavored Markdown)**, and **Rich Media Embeds**. Content creators can build high-density, interactive pages with ease.
    
| Feature | Supported | Notes |
| :--- | :---: | :--- |
| Markdown | ✅ | Full CommonMark support |
| Tables | ✅ | GFM style tables |
| Checkboxes | ✅ | \`- [ ]\` and \`- [x]\` |
| Video Embeds | ✅ | IFrame, YouTube, and local video |
| Code Snippets | ✅ | Syntax highlighting provided |
    `,
    translations: {
      ar: {
        title: 'المحتوى الغني والتأليف',
        content: 'يدعم كوبتوجرام تأليف المحتوى المتقدم باستخدام Markdown وGFM وتضمينات الوسائط الغنية.'
      }
    },
    items: [
      {
        id: 'markdown-basics',
        title: 'Markdown Authoring',
        description: 'Use standard markdown to format your ministry teachings. This includes **bold**, *italics*, and [links](https://coptogram.com).',
        translations: {
          ar: {
            title: 'تأليف الماركدوان',
            description: 'استخدم الماركدوان القياسي لتنسيق تعاليم خدمتك.'
          }
        }
      },
      {
        id: 'media-embeds',
        title: 'Embedding Rich Media',
        description: `You can embed videos directly into your documentation using HTML snippets:
        
<div style="aspect-ratio: 16/9; width: 100%; max-width: 640px; background: #eee; border-radius: 12px; display: flex; items-center justify-center; border: 1px dashed #ccc; margin: 20px 0;">
  <div style="text-align: center; color: #666;">
    <p style="font-weight: bold; margin-bottom: 8px;">Video Player Placeholder</p>
    <p style="font-size: 12px;">(e.g. YouTube, Vimeo, or Agora Replay)</p>
  </div>
</div>

*Embed code example:*
\`\`\`html
<iframe src="https://www.youtube.com/embed/..." frameborder="0" allowfullscreen></iframe>
\`\`\`
`,
        translations: {
          ar: {
            title: 'تضمين الوسائط الغنية',
            description: 'يمكنك تضمين مقاطع الفيديو مباشرة في مستنداتك باستخدام قصاصات HTML.'
          }
        }
      }
    ]
  },
  {
    id: 'tutorials',
    title: 'Step-by-Step Tutorials',
    category: 'general',
    icon: 'Compass',
    content: 'Follow these comprehensive guides to master common workflows on the Coptogram platform.',
    translations: {
      ar: {
        title: 'دروس تعليمية خطوة بخطوة',
        content: 'اتبع هذه الأدلة الشاملة لإتقان سير العمل الشائع على منصة كوبتوجرام.'
      }
    },
    items: [
      {
        id: 'tutorial-first-course',
        title: 'Organization: Launching Your First Course',
        description: 'A complete walkthrough from account creation to your first student enrollment.',
        translations: {
          ar: {
            title: 'المنظمة: إطلاق دورتك الأولى',
            description: 'جولة كاملة من إنشاء الحساب إلى تسجيل أول طالب لك.',
            details: [
              'الخطوة 1: قم بتكوين إعدادات مؤسستك وألوان علامتك التجارية في لوحة تحكم المسؤول.',
              'الخطوة 2: أضف محاضرك الأول من خلال دعوته عبر البريد الإلكتروني تحت إدارة المستخدمين.',
              'الخطوة 3: أنشئ دورة جديدة وأضف ثلاث دروس على الأقل (نص أو SCORM).',
              'الخطوة 4: حدد السعر (مجاني أو مدفوع) وانشر الدورة في الكتالوج العام.'
            ]
          }
        },
        details: [
          'Step 1: Configure your Organization settings and brand colors in the Admin Dashboard.',
          'Step 2: Add your first Instructor by inviting them via email under User Management.',
          'Step 3: Create a new Course and add at least three lessons (Text or SCORM).',
          'Step 4: Set the pricing (Free or Paid) and publish the course to the public catalog.'
        ]
      },
      {
        id: 'tutorial-certification',
        title: 'Student: Getting Your First Certificate',
        description: 'Learn the full lifecycle of a digital disciple on Coptogram.',
        translations: {
          ar: {
            title: 'الطالب: الحصول على شهادتك الأولى',
            description: 'تعرف على دورة الحياة الكاملة للتلميذ الرقمي على كوبتوجرام.',
            details: [
              'الخطوة 1: استخدم شريط البحث أو الكتالوج للعثور على دورة تهمك.',
              'الخطوة 2: سجل في الدورة وأكمل جميع الدروس بالتتابع.',
              'الخطوة 3: خض الاختبار النهائي وحقق الحد الأدنى لدرجة النجاح (عادة 70%).',
              'الخطوة 4: قم بتنزيل شهادة PDF المعتمدة من لوحة تحكم الإنجازات الخاصة بك.'
            ]
          }
        },
        details: [
          'Step 1: Use the Search bar or Catalog to find a course that interests you.',
          'Step 2: Enroll in the course and complete all lessons sequentially.',
          'Step 3: Take the Final Quiz and achieve the minimum passing grade (usually 70%).',
          'Step 4: Download your verified PDF certificate from your Achievement dashboard.'
        ]
      },
      {
        id: 'tutorial-live-session',
        title: 'General: Hosting a Live Teaching Session',
        description: 'How to coordinate a real-time spiritual teaching.',
        translations: {
          ar: {
            title: 'عام: استضافة جلسة تعليم مباشرة',
            description: 'كيفية تنسيق تعليم روحي في الوقت الفعلي.',
            details: [
              'الخطوة 1: قم بجدولة الفصل المباشر في منهج دورتك باستخدام تكامل Agora.',
              'الخطوة 2: أرسل إشعاراً جماعياً لجميع الطلاب المسجلين عبر نظام الرسائل الداخلي.',
              'الخطوة 3: في يوم الجلسة، ادخل إلى الاستوديو المباشر قبل 15 دقيقة لاختبار الصوت/الفيديو.',
              'الخطوة 4: سجل الجلسة لتظهر تلقائياً كإعادة للطلاب الذين فاتهم الحضور.'
            ]
          }
        },
        details: [
          'Step 1: Schedule the Live Class in your Course curriculum using the Agora integration.',
          'Step 2: Send a broadcast notification to all enrolled students via the internal messaging system.',
          'Step 3: On the day of the session, enter the Live Studio 15 minutes early to test your audio/video.',
          'Step 4: Record the session so it automatically appears as a replay for students who missed it.'
        ]
      }
    ]
  },
  {
    id: 'component-ui-patterns',
    title: 'Documentation UI Patterns',
    category: 'general',
    icon: 'Layout',
    content: 'Coptogram documentation supports premium interactive components. Use these patterns to make your spiritual content more engaging and readable.',
    translations: {
      ar: {
        title: 'أنماط واجهة التوثيق',
        content: 'يدعم توثيق كوبتوجرام مكونات تفاعلية مميزة. استخدم هذه الأنماط لجعل محتواك الروحي أكثر جاذبية وقابلية للقراءة.'
      }
    },
    items: [
      {
        id: 'ui-alerts',
        title: 'Information Alerts',
        description: `Alerts are perfect for highlighting tips, warnings, or success messages.\n\n<div class='alert info'>This is an information alert. Use it for neutral tips or supplementary data.</div>\n<div class='alert success'>This is a success alert. Use it when a user completes a task or reaches a goal.</div>\n<div class='alert warning'>This is a warning alert. Use it for critical information that requires attention.</div>`,
        code: `<div class='alert info'>Your message here...</div>\n<div class='alert success'>Task completed successfully!</div>\n<div class='alert warning'>Please back up your data.</div>`
      },
      {
        id: 'ui-quotes',
        title: 'Quotes & Emphasis',
        description: `Use blockquotes to highlight spiritual wisdom or key vision statements.\n\n<blockquote class='s1'>\n  "The heart of man is a vast ocean, and only God can fill its depths."\n  <span>Spiritual Wisdom</span>\n</blockquote>`,
        code: `<blockquote class='s1'>\n  Your profound quote here...\n  <span>Author Name</span>\n</blockquote>`
      },
      {
        id: 'ui-buttons',
        title: 'Interactive Buttons',
        description: `Create clear calls to action with styled buttons.\n\n<div class='flex gap-4'>\n  <a class='button' href='#'>Primary Action</a>\n  <a class='button ln' href='#'>Secondary Action</a>\n</div>`,
        code: `<a class='button' href='URL'>Label</a>\n<a class='button ln' href='URL'>Outline Label</a>`
      },
      {
        id: 'ui-steps',
        title: 'Interactive Steps',
        description: `Create dynamic walkthroughs with real-time scroll tracking and progress indicators.\n\n<ol class='steps'>\n  <li>Define your documentation goals.</li>\n  <li>Capture high-quality screenshots and assets.</li>\n  <li>Write clear, concise steps for your audience.</li>\n</ol>`,
        code: `<ol class='steps'>\n  <li>Step 1 description</li>\n  <li>Step 2 description</li>\n</ol>`
      }
    ]
  }
];
