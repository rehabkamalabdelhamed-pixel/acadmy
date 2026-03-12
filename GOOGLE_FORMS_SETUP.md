# دليل ربط Google Forms بالموقع — إرسال الدرجات تلقائياً

## المتطلبات
- شيت Google Forms يجمع درجات الطلاب
- السيرفر متاح على الإنترنت (ngrok أو استضافة عامة)
- ملفات شاملة بريد الطالب واسمه والدرجة

---

## الخطوة 1: تحضير ngrok لجعل السيرفر متاحاً علناً

1. **حمّل ngrok**: https://ngrok.com/download
2. **شغّل في طرفية منفصلة**:
   ```bash
   ngrok http 3000
   ```
3. **انسخ الرابط العام** (يبدأ بـ `https://`، مثال: `https://12abc34def.ngrok.io`)

---

## الخطوة 2: تحضير Google Form

**أعمدة مهمة في جدول الاستجابات (ضروري):**
1. **البريد الإلكتروني** — اسم العمود يجب أن يكون: `البريد الإلكتروني` أو `Email`
2. **اسم الطالب** — اسم العمود: `اسم الطالب` أو `Name`
3. **النقاط** — اسم العمود: `النقاط` أو `Score` أو `Total points`

**مثال جدول الاستجابات:**
| البريد الإلكتروني | اسم الطالب | النقاط | Timestamp |
|---|---|---|---|
| student@gmail.com | ريحاب | 85 | ... |
| another@gmail.com | أحمد | 90 | ... |

---

## الخطوة 3: إضافة Apps Script

1. **افتح جدول الاستجابات** في Google Sheets
2. اضغط على **Extensions** (الإضافات) → **Apps Script**
3. **احذف الكود الموجود** واستبدله بالكود أدناه:
4. **عدّل بيانات الاتصال**:
   - استبدل `https://YOUR_PUBLIC_URL` برابط ngrok (مثال: `https://12abc34def.ngrok.io`)
   - استبدل أسماء الأعمدة إن كانت مختلفة

### كود Apps Script (انسخ واستبدل في editor):

```javascript
// ============ إعدادات ==============
const BACKEND_URL = 'https://YOUR_PUBLIC_URL'; // استبدل برابط ngrok
const EXAM_ID = 'prog-1'; // استبدل بـ معرف الامتحان

// أسماء الأعمدة في جدول الاستجابات (طابق مع الفورم)
const EMAIL_COLUMN = 'البريد الإلكتروني'; // أو 'Email'
const NAME_COLUMN = 'اسم الطالب'; // أو 'Name'
const SCORE_COLUMN = 'النقاط'; // أو 'Score' أو 'Total points'
const MAX_SCORE = 10; // الحد الأقصى للدرجات

// ============ المشغل: يعمل عند إرسال الفورم ==============
function onFormSubmit(e) {
  try {
    // استخراج البيانات من الصف المرسل
    const values = e.values;
    const headers = e.namedValues; // كائن يحتوي جميع البيانات بأسماء أعمدة

    // استخراج البريد، الاسم، الدرجة
    const email = (headers[EMAIL_COLUMN] || [''])[0]?.trim();
    const studentName = (headers[NAME_COLUMN] || [''])[0]?.trim();
    const scoreRaw = (headers[SCORE_COLUMN] || [''])[0]?.trim();
    const score = parseFloat(scoreRaw) || 0;

    // التحقق من البيانات الأساسية
    if (!email || !studentName || score === 0) {
      Logger.log('⚠️ بيانات غير كاملة: email=' + email + ', name=' + studentName + ', score=' + score);
      return; // لا تُرسل إذا كانت بيانات ناقصة
    }

    // تحضير البيانات للإرسال
    const payload = {
      student: email,
      studentName: studentName,
      score: score,
      maxScore: MAX_SCORE
    };

    // تحضير طلب HTTP
    const url = `${BACKEND_URL}/exams/${encodeURIComponent(EXAM_ID)}/grades`;
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // لا تطرح أخطاء HTTP حتى لو فشل الطلب
    };

    // إرسال الطلب
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    // تسجيل النتيجة
    if (responseCode === 200 || responseCode === 201) {
      Logger.log('✅ تم إرسال الدرجة بنجاح: ' + email + ' - ' + score);
    } else {
      Logger.log('❌ خطأ في الإرسال: ' + responseCode + ' - ' + responseText);
    }
  } catch (err) {
    Logger.log('❌ خطأ في onFormSubmit: ' + err.toString());
  }
}

// ============ دالة اختبار (اختياري) ==============
function testSubmission() {
  // هذه الدالة لاختبار الكود بدون إرسال فورم فعلي
  const testEvent = {
    namedValues: {
      'البريد الإلكتروني': ['test@gmail.com'],
      'اسم الطالب': ['ريحاب'],
      'النقاط': ['85']
    }
  };
  onFormSubmit(testEvent);
  Logger.log('اختبار تم! تحقق من Logs أعلاه.');
}
```

---

## الخطوة 4: إعداد المشغل (Trigger)

1. **في نفس صفحة Apps Script editor**:
   - اضغط على **Triggers** (أيقونة ساعة على اليسار)
2. **اضغط على + New Trigger** (أسفل يمين)
3. **اختر**:
   - **Choose which function to run**: `onFormSubmit`
   - **Which deployment should be executed**: `Head`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On form submit`
4. **اضغط Save** وامنح الأذونات المطلوبة

---

## الخطوة 5: اختبار

### اختبار الكود (قبل الإرسال الفعلي):
1. في Apps Script editor، اختر الدالة `testSubmission` من القائمة العلوية
2. اضغط **Run** ▶️
3. افتح **Logs** (من القائمة) وتحقق من النتيجة:
   - ✅ `تم إرسال الدرجة بنجاح` = كل شيء صحيح
   - ❌ `خطأ في الإرسال` = تحقق من الرابط والإعدادات

### اختبار حقيقي:
1. سجّل دخول طالب في الموقع (سجّل البريد في localStorage)
2. افتح الفورم → ملئ البطاقة → اضغط Submit
3. افتح لوحة المدرّس → **الدرجات** → اختر الامتحان
4. **يجب أن تظهر الدرجة تلقائياً**

---

## استكشاف الأخطاء

### المشكلة: الدرجة لا تظهر
**الحل**:
1. افتح Logs في Apps Script: هل تری `✅ تم الإرسال` أم `❌ خطأ`؟
2. إذا `❌ خطأ`: تحقق من:
   - رابط ngrok صحيح؟ (ابدأ ngrok من جديد إذا انقطع)
   - معرف الامتحان `EXAM_ID` = `prog-1`؟
   - أسماء الأعمدة تطابق الجدول؟
3. اختبر الرابط مباشرة من طرفية:
   ```bash
   curl -X POST https://YOUR_PUBLIC_URL/exams/prog-1/grades \
     -H "Content-Type: application/json" \
     -d '{"student":"test@gmail.com","studentName":"test","score":85,"maxScore":10}'
   ```

### المشكلة: ngrok انقطع (timeout)
**الحل**:
1. أعد تشغيل ngrok: `ngrok http 3000`
2. انسخ الرابط الجديد
3. عدّل `BACKEND_URL` في Apps Script بالرابط الجديد

### المشكلة: البريد لا يطابق localStorage
**الحل**:
- تأكد أن البريد الذي يُدخله الطالب في الفورم = البريد الموجود في `localStorage.userEmail` في المتصفح
- أو استخدم ميزة البحث بالاسم (الموقع سيطلب الاسم ويربط الدرجات)

---

## الخطوات السريعة (ملخص)

```bash
# 1. شغّل ngrok
ngrok http 3000

# 2. انسخ الرابط HTTPS من ngrok (https://...)

# 3. عدّل في Apps Script:
#    - استبدل BACKEND_URL برابط ngrok
#    - تحقق من أسماء الأعمدة
#    - اضغط Save

# 4. أضف Trigger: Extensions > Apps Script > Triggers > New Trigger
#    - onFormSubmit
#    - On form submit

# 5. اختبر: Run testSubmission() وتحقق من Logs

# 6. شغّل على الحقيقي: طالب يملأ الفورم → الدرجة في الموقع تلقائياً ✅
```

---

## ملاحظات مهمة

- **ngrok ينتهي بعد ساعات**: استخدم الخطة المدفوعة أو أعد تشغيله يومياً
- **خيار أفضل**: نشر السيرفر على استضافة (Heroku، Railway، DigitalOcean)
- **أمان**: لا تضع كلمات مرور أو بيانات حساسة في Apps Script

---

**للمساعدة**: إذا واجهت مشاكل، أرسل صورة Logs من Apps Script وأساعدك! 🚀
