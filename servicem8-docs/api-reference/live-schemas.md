# ServiceM8 API — Schémas de données réels

Extrait directement de l'API le 20 février 2026.

---

## job.json

**Records**: 689

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `4dbf13e0-16d6-47b4-9f0f-21028a2b6cab` |
| `active` | int | `0` |
| `date` | str | `2024-02-20 00:00:00` |
| `job_address` | str | `358 Rue Houde, La Prairie, QC J5R 3B6, Canada` |
| `billing_address` | str | `358 Rue Houde, La Prairie, QC J5R 3B6, Canada` |
| `status` | str | `Work Order` |
| `quote_date` | str | `2024-02-20 12:57:48` |
| `work_order_date` | str | `2024-02-20 12:57:49` |
| `work_done_description` | str | `Installed new chrome basin mixer, and replaced the water lines & basin trap.` |
| `generated_job_id` | str | `SAMPLE` |
| `completion_date` | str | `0000-00-00 00:00:00` |
| `completion_actioned_by_uuid` | str | `` |
| `unsuccessful_date` | str | `0000-00-00 00:00:00` |
| `payment_date` | str | `0000-00-00 00:00:00` |
| `payment_method` | str | `` |
| `payment_amount` | int | `0` |
| `payment_actioned_by_uuid` | str | `` |
| `edit_date` | str | `2024-02-20 16:56:45` |
| `payment_note` | str | `` |
| `ready_to_invoice` | str | `0` |
| `ready_to_invoice_stamp` | str | `0000-00-00 00:00:00` |
| `company_uuid` | str | `ff9b6448-f6f1-44db-a017-210282fc940b` |
| `geo_is_valid` | int | `1` |
| `lng` | float | `-73.4996395` |
| `lat` | float | `45.4085946` |
| `geo_country` | str | `Canada` |
| `geo_postcode` | str | `J5R 3B6` |
| `geo_state` | str | `QC` |
| `geo_city` | str | `La Prairie` |
| `geo_street` | str | `Rue Houde` |
| `geo_number` | str | `358` |
| `payment_processed` | int | `0` |
| `payment_processed_stamp` | str | `0000-00-00 00:00:00` |
| `payment_received` | int | `0` |
| `payment_received_stamp` | str | `0000-00-00 00:00:00` |
| `total_invoice_amount` | str | `393.7500` |
| `job_is_scheduled_until_stamp` | str | `0000-00-00 00:00:00` |
| `category_uuid` | str | `296c1770-2f8a-46bf-80e3-210284ae9a5b` |
| `queue_uuid` | str | `` |
| `queue_expiry_date` | str | `0000-00-00 00:00:00` |
| `badges` | str | `` |
| `quote_sent` | bool | `False` |
| `invoice_sent` | bool | `False` |
| `purchase_order_number` | str | `` |
| `invoice_sent_stamp` | str | `0000-00-00 00:00:00` |
| `queue_assigned_staff_uuid` | str | `` |
| `quote_sent_stamp` | str | `0000-00-00 00:00:00` |
| `job_description` | str | `Install new basin mixer in staff bathroom. 
- Remember to tap ‘Start Job’
- Take` |
| `created_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |

---

## company.json

**Records**: 1598

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `ff9b6448-f6f1-44db-a017-210282fc940b` |
| `edit_date` | str | `2024-02-20 12:57:48` |
| `name` | str | `Help Guide Job` |
| `website` | str | `` |
| `abn_number` | str | `` |
| `address` | str | `` |
| `address_street` | str | `` |
| `address_city` | str | `` |
| `address_state` | str | `` |
| `address_postcode` | str | `` |
| `address_country` | str | `` |
| `billing_address` | str | `` |
| `active` | int | `0` |
| `is_individual` | int | `0` |
| `badges` | str | `` |
| `fax_number` | str | `` |
| `tax_rate_uuid` | str | `` |
| `billing_attention` | str | `0` |
| `payment_terms` | str | `` |

---

## companycontact.json

**Records**: 1802

| Champ | Type | Exemple |
|---|---|---|
| `edit_date` | str | `2024-06-25 12:04:00` |
| `active` | int | `1` |
| `is_primary_contact` | str | `1` |
| `company_uuid` | str | `9850af1c-1c06-487e-b035-2180336e188b` |
| `first` | str | `` |
| `last` | str | `` |
| `email` | str | `tilibi@hotmail.com` |
| `phone` | str | `+15147026572` |
| `mobile` | str | `` |
| `type` | str | `BILLING` |
| `uuid` | str | `0013cfd0-7b6e-4feb-8c15-21803a1e75eb` |

---

## staff.json

**Records**: 4

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `first` | str | `henri` |
| `last` | str | `joannette` |
| `email` | str | `joannettehenri06@gmail.com` |
| `active` | int | `1` |
| `lng` | int | `0` |
| `lat` | int | `0` |
| `geo_timestamp` | str | `0000-00-00 00:00:00` |
| `mobile` | str | `514-813-8956` |
| `hide_from_schedule` | int | `0` |
| `edit_date` | str | `2026-02-20 12:13:10` |
| `color` | str | `EE7866` |
| `navigating_to_job_uuid` | str | `` |
| `navigating_timestamp` | str | `2025-09-24 12:57:12` |
| `navigating_expiry_timestamp` | str | `0000-00-00 00:00:00` |
| `status_message` | str | `` |
| `status_message_timestamp` | str | `2026-01-14 16:29:39` |
| `job_title` | str | `propriétaire` |
| `labour_material_uuid` | str | `` |
| `custom_icon_url` | str | `CustomStaffSprite?id=63862f15-4d26-4698-8525-21028810ce2b&_dc=1` |
| `can_receive_push_notification` | int | `1` |
| `security_role_uuid` | str | `6932c2e8-2707-4dc7-92ed-21028554c84b` |

---

## jobactivity.json

**Records**: 982

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `23f5ffce-4513-47c3-b292-21028ed4e5fb` |
| `start_date` | str | `2024-02-20 13:00:00` |
| `end_date` | str | `2024-02-20 14:00:00` |
| `active` | int | `0` |
| `activity_was_recorded` | int | `0` |
| `activity_was_automated` | int | `0` |
| `edit_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `edit_date` | str | `2024-02-20 16:40:52` |
| `job_uuid` | str | `4dbf13e0-16d6-47b4-9f0f-21028a2b6cab` |
| `staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `activity_was_scheduled` | int | `1` |
| `has_been_opened` | int | `1` |
| `has_been_opened_timestamp` | str | `2024-02-20 13:51:03` |
| `travel_time_in_seconds` | str | `0` |
| `travel_distance_in_meters` | str | `0` |
| `material_uuid` | str | `` |
| `allocated_timestamp` | str | `2024-02-20 16:40:52` |
| `allocated_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |

---

## joballocation.json

**Records**: 2

| Champ | Type | Exemple |
|---|---|---|
| `edit_date` | str | `2024-04-05 12:39:20` |
| `active` | int | `0` |
| `job_uuid` | str | `62048ed6-5b52-4d92-aef8-211e0b591fab` |
| `queue_uuid` | str | `` |
| `staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `allocation_window_uuid` | str | `b681d925-49b8-4bdf-a3ad-21028c36d53b` |
| `allocated_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `allocated_timestamp` | str | `2024-04-05 12:36:25` |
| `expiry_timestamp` | str | `2044-04-09 00:00:00` |
| `read_timestamp` | str | `2024-04-05 12:38:41` |
| `completion_timestamp` | str | `0000-00-00 00:00:00` |
| `estimated_duration` | str | `30` |
| `revised_duration` | str | `0` |
| `sort_priority` | str | `1` |
| `requires_acceptance` | str | `0` |
| `acceptance_status` | str | `0` |
| `acceptance_timestamp` | str | `0000-00-00 00:00:00` |
| `allocation_date` | str | `2024-04-09 00:00:00` |
| `uuid` | str | `08648e13-0891-489b-955d-212f0580bcfb` |

---

## jobcontact.json

**Records**: 700

| Champ | Type | Exemple |
|---|---|---|
| `edit_date` | str | `2024-06-11 18:36:57` |
| `active` | int | `1` |
| `job_uuid` | str | `6f143ccf-e3a5-4c3b-a6c6-217291efaa2b` |
| `first` | str | `Renald` |
| `last` | str | `Caluori` |
| `email` | str | `rcaluori@bell.net` |
| `phone` | str | `4504583081` |
| `mobile` | str | `5142324750` |
| `type` | str | `JOB` |
| `uuid` | str | `00367b4b-7407-4c48-b657-21729cc8f92b` |

---

## jobmaterial.json

**Records**: 681

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `a2bb91f9-c314-4899-83af-21028fd13eeb` |
| `tax_rate_uuid` | str | `5f6baf4c-aa9c-415b-a264-21028443e18b` |
| `quantity` | str | `1.0000` |
| `name` | str | `Basin mixer tap (chrome)` |
| `price` | str | `198.9000` |
| `active` | int | `1` |
| `displayed_amount_is_tax_inclusive` | str | `1` |
| `displayed_amount` | str | `198.9000` |
| `edit_date` | str | `2024-02-20 12:58:10` |
| `job_uuid` | str | `4dbf13e0-16d6-47b4-9f0f-21028a2b6cab` |
| `material_uuid` | str | `26eae6f7-dd33-4eb4-9099-2102868e160b` |
| `sort_order` | str | `0` |
| `cost` | str | `0.0000` |
| `displayed_cost` | str | `0.0000` |

---

## jobpayment.json

**Records**: 478

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `cb35dc22-b7cf-478c-85a3-21028bbce35b` |
| `edit_date` | str | `2024-02-20 16:06:22` |
| `active` | int | `0` |
| `job_uuid` | str | `4d16337e-210f-4bc8-af16-21028c71a0fb` |
| `timestamp` | str | `2024-02-21 00:00:00` |
| `amount` | str | `200.0000` |
| `method` | str | `Cash` |
| `note` | str | `` |
| `attachment_uuid` | str | `` |
| `actioned_by_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `is_deposit` | str | `0` |

---

## note.json

**Records**: 824

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `da0209db-e7cf-4e74-b51f-2102822a24cb` |
| `edit_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `create_date` | str | `2024-02-20 12:57:50` |
| `edit_date` | str | `2024-02-20 12:57:50` |
| `active` | int | `1` |
| `note` | str | `Client has requested a quality WELS 6-star single mixer with chrome finish.` |
| `action_required` | str | `0` |
| `action_completed_by_staff_uuid` | str | `` |
| `related_object` | str | `job` |
| `related_object_uuid` | str | `4dbf13e0-16d6-47b4-9f0f-21028a2b6cab` |

---

## task.json

**Records**: 0 (endpoint vide)

---

## category.json

**Records**: 4

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `296c1770-2f8a-46bf-80e3-210284ae9a5b` |
| `edit_date` | str | `2024-02-20 17:57:44` |
| `name` | str | `Standard` |
| `colour` | str | `ffd098` |
| `active` | int | `1` |

---

## badge.json

**Records**: 30

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `249f79df-34e6-4855-94e3-21028a8642cb` |
| `edit_date` | str | `2024-02-20 12:58:09` |
| `active` | int | `1` |
| `file_name` | str | `badges_large_001.png` |
| `automatically_allocated` | int | `0` |
| `regarding_form_uuid` | str | `` |
| `name` | str | `Warranty` |

---

## attachment.json

**Records**: 1644

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `899dd08e-d24a-4639-b712-21028cc2602b` |
| `edit_date` | str | `2024-02-20 12:57:50` |
| `active` | int | `1` |
| `attachment_name` | str | `sample_photo_2.jpeg` |
| `file_type` | str | `.jpg` |
| `photo_width` | str | `4032` |
| `photo_height` | str | `3024` |
| `attachment_source` | str | `` |
| `lng` | int | `0` |
| `lat` | int | `0` |
| `tags` | str | `` |
| `extracted_info` | str | `` |
| `is_favourite` | str | `0` |
| `metadata` | bool | `False` |
| `created_by_staff_uuid` | str | `63862f15-4d26-4698-8525-21028810ce2b` |
| `timestamp` | str | `2024-02-20 12:57:50` |
| `related_object` | str | `job` |
| `related_object_uuid` | str | `4dbf13e0-16d6-47b4-9f0f-21028a2b6cab` |

---

## allocationwindow.json

**Records**: 4

| Champ | Type | Exemple |
|---|---|---|
| `edit_date` | str | `2024-02-20 12:58:09` |
| `active` | int | `1` |
| `sort_priority` | str | `0` |
| `name` | str | `Urgent` |
| `start_time` | str | `0` |
| `end_time` | str | `0` |
| `uuid` | str | `15198c57-dc89-4048-9878-2102800d346b` |

---

## jobqueue.json

**Records**: 9

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `16816c9c-67a3-499f-b8cb-2102891806fb` |
| `name` | str | `Juillet` |
| `default_timeframe` | int | `7` |
| `active` | int | `1` |
| `edit_date` | str | `2024-02-26 13:14:50` |
| `subscribed_staff` | str | `` |
| `requires_assignment` | str | `0` |

---

## location.json

**Records**: 1

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `e997aaf9-7780-4312-9b9e-21028d52de2b` |
| `edit_date` | str | `2025-05-19 16:41:12` |
| `name` | str | `Head Office` |
| `active` | int | `1` |
| `line1` | str | `3054 Rue Gélineau` |
| `line2` | str | `` |
| `city` | str | `Longueuil` |
| `country` | str | `Canada` |
| `post_code` | str | `J3Y 4K7` |
| `phone_1` | str | `514-813-8956` |
| `line3` | str | `` |
| `state` | str | `QC` |
| `lng` | float | `-73.4233237` |
| `lat` | float | `45.5005092` |

---

## taxrate.json

**Records**: 18

| Champ | Type | Exemple |
|---|---|---|
| `name` | str | `TPS/TVQ` |
| `amount` | str | `14.9750` |
| `edit_date` | str | `2024-08-22 14:36:36` |
| `active` | int | `0` |
| `is_default_tax_rate` | str | `0` |
| `uuid` | str | `07e8d37e-2981-41e4-8d6a-21028997343b` |

---

## formresponse

**Erreur**: 400

---

## asset

**Erreur**: 400

---

## assettype

**Erreur**: 400

---

## assettypefield

**Erreur**: 400

---

## securityrole.json

**Records**: 7

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `6932c2e8-2707-4dc7-92ed-21028554c84b` |
| `name` | str | `Default Business Owner Role` |
| `edit_date` | str | `2025-03-08 03:06:45` |
| `active` | int | `1` |
| `role_description` | str | `Full access to everything.` |

---

## vendorpayment

**Erreur**: 400

---

## material.json

**Records**: 28

| Champ | Type | Exemple |
|---|---|---|
| `uuid` | str | `26eae6f7-dd33-4eb4-9099-2102868e160b` |
| `name` | str | `Basin mixer tap (chrome)` |
| `price` | float | `198.9` |
| `active` | int | `0` |
| `barcode` | str | `` |
| `item_number` | str | `SAMPLE1` |
| `cost` | int | `0` |
| `quantity_in_stock` | int | `0` |
| `price_includes_taxes` | int | `1` |
| `item_is_inventoried` | str | `0` |
| `edit_date` | str | `2024-02-20 12:57:51` |
| `tax_rate_uuid` | str | `` |
| `item_description` | str | `` |
| `use_description_for_invoicing` | int | `0` |

---

