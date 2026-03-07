
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** orcafacil
- **Date:** 2026-03-07
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Dashboard loads and shows key metrics and recent activity
- **Test Code:** [TC001_Dashboard_loads_and_shows_key_metrics_and_recent_activity.py](./TC001_Dashboard_loads_and_shows_key_metrics_and_recent_activity.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Dashboard did not load after login; current URL remains '/app/login' and page did not navigate to the dashboard.
- 'Total quotes' not found on the page; expected business metric missing.
- 'Clients' not found on the page; expected metric missing.
- 'Recent activity' not found on the page; expected activity feed missing.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/df015e7b-954b-40a7-86fc-8687d25cbe1c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 New Quote quick action navigates to Create New Quote page
- **Test Code:** [TC002_New_Quote_quick_action_navigates_to_Create_New_Quote_page.py](./TC002_New_Quote_quick_action_navigates_to_Create_New_Quote_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/435f30dc-182b-48e5-b970-a9834ca6a93b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 New Client quick action navigates to Clients page
- **Test Code:** [TC003_New_Client_quick_action_navigates_to_Clients_page.py](./TC003_New_Client_quick_action_navigates_to_Clients_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/a50e5e0a-90e4-4eb9-bed8-a28714c655c1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Create a new client with valid B2B/B2C fields and see it in the list
- **Test Code:** [TC006_Create_a_new_client_with_valid_B2BB2C_fields_and_see_it_in_the_list.py](./TC006_Create_a_new_client_with_valid_B2BB2C_fields_and_see_it_in_the_list.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- CPF/CNPJ (document) input field not found in the 'Novo Cliente' modal — required feature missing.
- Client creation with a document cannot be completed because the document input is not available in the form.
- The client was not saved; the Save action was not performed due to the missing document field.
- The clients list was not updated with 'Cliente Teste E2E' as a result of the incomplete creation process.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/f15201c5-4519-41b7-9fc0-9dc881fa026c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Open an existing client detail view from the list
- **Test Code:** [TC007_Open_an_existing_client_detail_view_from_the_list.py](./TC007_Open_an_existing_client_detail_view_from_the_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/415e7d3e-1703-4f8a-9198-d0077704549e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Edit a client email and verify updated details are displayed
- **Test Code:** [TC008_Edit_a_client_email_and_verify_updated_details_are_displayed.py](./TC008_Edit_a_client_email_and_verify_updated_details_are_displayed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/d742d120-4bd6-4200-aeb2-ffb244d1bfa4
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Validate error when creating a client with an invalid email
- **Test Code:** [TC009_Validate_error_when_creating_a_client_with_an_invalid_email.py](./TC009_Validate_error_when_creating_a_client_with_an_invalid_email.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- New Client modal not found or did not open after clicking 'Criar Novo' multiple times (elements tried: 1544, 1538, 1545).
- No client name or email input fields are present on the page, preventing form interaction.
- Unable to verify invalid-email validation because the client creation form cannot be opened.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/23ca3ab4-fcef-4fae-a9ac-9247fee091bf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Delete a client from the detail view and verify it is removed from the list
- **Test Code:** [TC010_Delete_a_client_from_the_detail_view_and_verify_it_is_removed_from_the_list.py](./TC010_Delete_a_client_from_the_detail_view_and_verify_it_is_removed_from_the_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/237ff1b7-9aa8-4264-8fd2-cc1ee4af1a89
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Complete quote creation form: select client, add item, configure payment, toggle warranty, and save
- **Test Code:** [TC012_Complete_quote_creation_form_select_client_add_item_configure_payment_toggle_warranty_and_save.py](./TC012_Complete_quote_creation_form_select_client_add_item_configure_payment_toggle_warranty_and_save.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/40222720-39af-44dc-a9a6-1d3b8c4077b6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Save a quote after adding item details and verify it appears in details view
- **Test Code:** [TC013_Save_a_quote_after_adding_item_details_and_verify_it_appears_in_details_view.py](./TC013_Save_a_quote_after_adding_item_details_and_verify_it_appears_in_details_view.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/3d891229-b3d5-4aad-99b1-59dc7edc190f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Validation: attempt to save a quote without items
- **Test Code:** [TC014_Validation_attempt_to_save_a_quote_without_items.py](./TC014_Validation_attempt_to_save_a_quote_without_items.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - application did not redirect to an authenticated '/app' page after two login attempts.
- Quotes flow unreachable - the 'Quotes' page and subsequent actions could not be accessed because the user is not authenticated.
- Save Quote validation could not be tested - 'New Quote' and 'Save Quote' actions were not executed due to lack of access to the authenticated dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/37e089f1-c1ff-4603-8aaa-9d2555a04c89
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Open a quote from the quotes list and view quote details
- **Test Code:** [TC016_Open_a_quote_from_the_quotes_list_and_view_quote_details.py](./TC016_Open_a_quote_from_the_quotes_list_and_view_quote_details.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Clicking a quote row/card did not open the quote details page; the dashboard (Visão Geral) remained visible after multiple click attempts.
- Click attempts were made on quote row anchors but no navigation to a detail URL or rendering of detail content occurred.
- No quote detail text 'Quote' or 'Generate PDF' element was present in the DOM or visible after the clicks.
- The quotes list shows anchors but click handlers or routing appear to be non-functional for opening quote details.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/f7aa8265-954d-4476-a7e8-3fd8ac64754d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Edit an existing quote and save changes
- **Test Code:** [TC017_Edit_an_existing_quote_and_save_changes.py](./TC017_Edit_an_existing_quote_and_save_changes.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/bf37c561-bb63-4e0a-b876-11f84f376433
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Update company name and address and save successfully
- **Test Code:** [TC018_Update_company_name_and_address_and_save_successfully.py](./TC018_Update_company_name_and_address_and_save_successfully.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Address input field labeled 'Endereço' not found on the profile/settings page, preventing address editing.
- Company name edit cannot be fully validated together with address editing because the address field is missing.
- Although 'Salvar Alterações' was clicked, the absence of an address field prevents verification of full profile update functionality.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/db57476c-325b-4ae3-964b-2551c7cebdb7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Save confirmation is shown after updating profile
- **Test Code:** [TC019_Save_confirmation_is_shown_after_updating_profile.py](./TC019_Save_confirmation_is_shown_after_updating_profile.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - valid credentials were submitted but the UI remained on the login page and did not navigate to a dashboard or post-login view.
- Profile navigation not available - no 'Profile' link or dashboard elements appeared after sign-in attempts, preventing profile update steps.
- Sign-in interactions (two attempts) did not trigger a visible success state or an error message indicating why authentication failed.
- Login form remained visible with email input (index 4187) and password input (index 4192) after repeated sign-in attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/47c6308c-0482-4ad3-99c7-74872aa37981
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Change password from profile settings successfully
- **Test Code:** [TC021_Change_password_from_profile_settings_successfully.py](./TC021_Change_password_from_profile_settings_successfully.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Submit button did not navigate away from the login page after multiple sign-in attempts with the provided credentials.
- The application displayed a brief loading state ('Carregando...') with 0 interactive elements and then returned to the login form instead of opening the dashboard.
- No navigation to the dashboard or profile area was observed, preventing access to profile settings.
- Password change could not be tested because a user session was not established after repeated login attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/038da0bc-a0cc-4e14-9382-dd2d38ef3090
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Add a new service with valid name and price
- **Test Code:** [TC024_Add_a_new_service_with_valid_name_and_price.py](./TC024_Add_a_new_service_with_valid_name_and_price.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- New service 'Brake inspection' not found in the services list after clicking 'Adicionar'.
- No success message or confirmation shown after attempting to add the service.
- Service list displays existing items but does not include the newly added 'Brake inspection'.
- Add action was attempted once but did not produce a visible new entry or update in the list.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/ad5f9d1a-0085-49d4-9ccc-06d7209f7c9a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Prevent saving a service with a negative price
- **Test Code:** [TC025_Prevent_saving_a_service_with_a_negative_price.py](./TC025_Prevent_saving_a_service_with_a_negative_price.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Dashboard page not reachable after login: the UI still shows the login form instead of the dashboard.
- 'Add new service' button or link not found on the current page, so the service creation form cannot be opened.
- Service creation form could not be accessed; therefore entering a negative price is not possible.
- Validation message verification ('must be') could not be performed because the Save action and form were not accessible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/20d8855f-df76-4f40-978e-67e870311194
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Edit an existing service and update its price
- **Test Code:** [TC026_Edit_an_existing_service_and_update_its_price.py](./TC026_Edit_an_existing_service_and_update_its_price.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Updated price 'R$ 199,00' not visible in the services catalog after saving changes.
- No occurrence of the string "199" or "R$ 199" found on the profile/services page.
- Edit/save actions were executed (edit modal opened and 'Salvar alterações' clicked) but the UI did not reflect the updated price.
- The services list continues to display existing prices (e.g., 'R$ 144,00', 'R$ 80,00', 'R$ 120,00', 'R$ 96,00', 'R$ 200,00') instead of the expected 'R$ 199,00'.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/4e06c0ce-ce2a-4103-bf63-b38a19549ff6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Open notification center from dashboard and see notification list
- **Test Code:** [TC028_Open_notification_center_from_dashboard_and_see_notification_list.py](./TC028_Open_notification_center_from_dashboard_and_see_notification_list.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Notifications bell icon not found on page
- Notifications header 'Notifications' not visible on page
- Notifications list element not present on page
- User remains on the login page (/app/login) after clicking 'Acessar Painel' instead of being redirected to an authenticated dashboard where notifications would be accessible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/1bc1f3e3-744e-46f1-b27a-935ad136e1ab
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Open a notification from the notification center
- **Test Code:** [TC029_Open_a_notification_from_the_notification_center.py](./TC029_Open_a_notification_from_the_notification_center.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - submitting the provided credentials did not navigate to the authenticated dashboard; the current page remains the login page (https://app.zacly.com/login).
- Notifications/bell icon not found on the accessible page after the login attempts, preventing access to the notifications list.
- No dashboard indicators (e.g., user menu, dashboard header, or notification icon) are visible to confirm successful authentication and enable testing of notification behavior.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/74239e8d-fdf3-429f-9340-e38097366445
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Mark a notification as read updates the unread badge count
- **Test Code:** [TC030_Mark_a_notification_as_read_updates_the_unread_badge_count.py](./TC030_Mark_a_notification_as_read_updates_the_unread_badge_count.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login did not complete - URL remains '/app/login' after submitting credentials.
- Unread notifications badge not found on page - notifications/bell not visible on the current (unauthenticated) page.
- Notification mark-as-read flow could not be tested because the user is not authenticated and remains on the login page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/3d73aec0-be6e-462e-8f85-b361e842aa61
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC036 Cancel subscription from Profile and confirm cancellation
- **Test Code:** [TC036_Cancel_subscription_from_Profile_and_confirm_cancellation.py](./TC036_Cancel_subscription_from_Profile_and_confirm_cancellation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/6796160a-82d7-418d-91c3-57d4cd00df42
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC037 Cancellation confirmation is visible after canceling subscription
- **Test Code:** [TC037_Cancellation_confirmation_is_visible_after_canceling_subscription.py](./TC037_Cancellation_confirmation_is_visible_after_canceling_subscription.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No visible cancellation confirmation message found on the profile page after confirming cancellation (no occurrences of 'cancelado', 'cancelamento', 'assinatura cancelada', 'assinatura encerrada', 'cancelada', etc.).
- The 'Cancelar assinatura' control remains present on the profile page after the cancellation confirmation action, indicating the subscription appears unchanged.
- No status badge or status text indicating the subscription was canceled is present in the visible DOM or extracted page content.
- The cancellation confirmation action was triggered (confirm click detected) but the UI did not change to reflect a canceled state.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/d8e24b47-c565-43aa-a7b7-8f81f0b587f1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC041 Submit a valid support ticket and see it appear in ticket history
- **Test Code:** [TC041_Submit_a_valid_support_ticket_and_see_it_appear_in_ticket_history.py](./TC041_Submit_a_valid_support_ticket_and_see_it_appear_in_ticket_history.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/b70f4856-06f5-4083-a7ab-dd0522e1b225
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC043 Submit support ticket with type and description and confirm success message
- **Test Code:** [TC043_Submit_support_ticket_with_type_and_description_and_confirm_success_message.py](./TC043_Submit_support_ticket_with_type_and_description_and_confirm_success_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/b993c219-0f39-413b-a058-cb9861deaa8c
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC044 Submit support ticket end-to-end and verify it is listed in history
- **Test Code:** [TC044_Submit_support_ticket_end_to_end_and_verify_it_is_listed_in_history.py](./TC044_Submit_support_ticket_end_to_end_and_verify_it_is_listed_in_history.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed: application did not navigate to the authenticated area after two sign-in attempts.
- Current URL does not contain '/app', indicating the session is not authenticated.
- Sign-in interactions did not produce an authenticated session, so downstream features (support widget, ticket creation, ticket history) cannot be tested.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/2fe791a5-899f-4d54-a080-906645b8397b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC045 Validation error when submitting a support ticket without description
- **Test Code:** [TC045_Validation_error_when_submitting_a_support_ticket_without_description.py](./TC045_Validation_error_when_submitting_a_support_ticket_without_description.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/2976feb2-d0bf-40f2-b379-fa930d97056f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC049 Create a new folder from Quotes page and verify it appears
- **Test Code:** [TC049_Create_a_new_folder_from_Quotes_page_and_verify_it_appears.py](./TC049_Create_a_new_folder_from_Quotes_page_and_verify_it_appears.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Create new folder control not found in the Quotes area after opening create menu and scrolling.
- No UI option to create a folder was detected; only 'Criar Novo' for creating an Orçamento is available.
- Unable to verify that an authenticated user can create and see a new folder in the Quotes area because the feature appears to be absent.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/dbff3654-e6b9-42e7-8b57-6965985c69d6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC050 Create folder with empty name shows validation error
- **Test Code:** [TC050_Create_folder_with_empty_name_shows_validation_error.py](./TC050_Create_folder_with_empty_name_shows_validation_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Create new folder control not found on the Quotes page after activating the 'Criar Novo' button.
- No folder name input or 'Save' button present in the page interactive elements, so the save-with-empty-name validation cannot be triggered.
- The required validation text "required" could not be verified because the folder-creation form/modal is not available.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f8b068e-075e-48d7-9248-8892560b325e/d238c914-a4c3-4e35-b879-9d7b2145d43b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **40.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---