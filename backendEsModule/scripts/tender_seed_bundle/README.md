
# Tender Vault Fake Seeder

## الفرق بين هذا البندل و `seedTenderVaultFakeOrders.mjs`

| | **هذا البندل** (`tender_vault_fake_seeder.cjs`) | **`seedTenderVaultFakeOrders.mjs`** |
|---|-----------------------------------------------|-------------------------------------|
| الصور | روابط محلية تحت `ASSET_BASE_URL` (مثل `/seed-assets/...`) + ملفات PNG في البندل | روابط Unsplash جاهزة في الحقل |
| التصنيفات | taxonomy مفصّل داخل السكربت (Design / Development / Content Writing مع subgroups) | منطق مختلف في الملف `.mjs` |
| الأوضاع | **preview** / **sql** / **insert** | إدخال مباشر عبر السكربت |

استخدم أحدهما حسب ما تريد: بندل للتحكم بالصور المحلية وملف SQL، أو `.mjs` إذا كان سير العمل الحالي عندك يعتمد عليه.

> **ملاحظة تقنية:** المشروع يستخدم `"type": "module"` في `package.json`. لذلك السكربت مسمّى **`tender_vault_fake_seeder.cjs`** (CommonJS) حتى يعمل `require('pg')` بدون أخطاء. لا تغيّر الامتداد إلى `.js` فقط.

---

هذا البندل يجهز لك **1000 tender fake** بشكل مرتب ومتناسق، مع:
- عناوين غير مكررة
- وصف متناسق مع التصنيف
- سعر ومدة منطقيين حسب نوع الخدمة
- `metadata.skills`
- صورة افتراضية حسب التصنيف الرئيسي:
  - Design
  - Development
  - Content Writing

## الملفات
- `tender_vault_fake_seeder.cjs`  
  سكربت Node.js لتوليد البيانات أو إدخالها مباشرة إلى قاعدة البيانات.
- `design-default.png`
- `programming-default.png`
- `writing-default.png`

## أين تضع الصور؟
ضع الصور الثلاث داخل مجلد يمكن للفرونت الوصول له، مثلاً:
- `public/seed-assets/`

بحيث تكون الروابط:
- `/seed-assets/design-default.png`
- `/seed-assets/programming-default.png`
- `/seed-assets/writing-default.png`

ولو عندك CDN أو Cloudinary غيّر:
```bash
ASSET_BASE_URL=https://your-cdn.com/seed-assets
```

## متطلبات التشغيل
```bash
npm i pg
```

## المتغيرات
```bash
DATABASE_URL=postgres://...
CREATED_BY_IDS=12,15,18
ASSET_BASE_URL=/seed-assets
```

> `CREATED_BY_IDS` اختياري. إذا لم تضعه، السكربت سيحاول تلقائياً اختيار users من جدول `users` غالباً role_id = 2.

## أوضاع التشغيل

### التشغيل من جذر `backendEsModule` (موصى به)

بعد تعيين المتغيرات في الطرفية (أو ملف `.env` تُحمّله يدوياً):

```powershell
cd backendEsModule
$env:DATABASE_URL="postgres://USER:PASS@HOST:5432/DBNAME"
$env:ASSET_BASE_URL="/seed-assets"
# اختياري: من أنشأ الطلبات
# $env:CREATED_BY_IDS="12,15,18"
```

#### 1) Preview (معاينة حتى 20 سجل + ملف JSON)
```bash
npm run seed:tender-bundle:preview
```
أو يدوياً:
```bash
node scripts/tender_seed_bundle/tender_vault_fake_seeder.cjs --mode=preview --count=20
```
الناتج يُحفظ تحت `seed-output/tender_vault_preview.json` (المجلد الحالي عند التشغيل، عادة `backendEsModule/seed-output`).

#### 2) Generate SQL (ملف `.sql` + JSON بدون INSERT للداتابيس)
يحتاج `DATABASE_URL` لقراءة التصنيفات من الجداول وربط `category_id` إن وُجدت:
```bash
npm run seed:tender-bundle:sql
```

#### 3) Insert Directly (إدخال مباشر على دفعات)
```bash
npm run seed:tender-bundle:insert
```

### التشغيل على مراحل
إذا أردت إدخالاً على دفعات:
```bash
node scripts/tender_seed_bundle/tender_vault_fake_seeder.cjs --mode=insert --count=200 --batch=50
```

ثم تعيد التشغيل لاحقاً بعد تعديل العدد لو أردت دفعة جديدة.

## ملاحظات مهمة
- السكربت يحاول resolve للـ:
  - `category_id`
  - `sub_category_id` (داخل metadata)
  - `sub_sub_category_id`
  من خلال **الأسماء** الموجودة عندك في الجداول.
- إذا بعض الأسماء غير موجودة في قاعدة البيانات، سيبقى الحقل nullable عند الحاجة، لكن سيحتفظ باسم التصنيف داخل `metadata`.
- جميع السجلات تُنشأ بحالة:
```text
stored
```

## لماذا هذا السكربت مناسب لواجهتك الحالية؟
لأن الواجهة عندك تعتمد على:
- `attachments` كـ array
- `metadata.skills`
- fallback لـ `metadata.sub_category_id`
- عرض `budget_min / budget_max`
- عرض `duration_value / duration_unit`

## اقتراح عملي
ابدأ بـ:
```bash
npm run seed:tender-bundle:preview
```

إذا أعجبك الناتج:
```bash
node scripts/tender_seed_bundle/tender_vault_fake_seeder.cjs --mode=insert --count=250 --batch=50
```

ثم كررها حتى تصل إلى 1000.
