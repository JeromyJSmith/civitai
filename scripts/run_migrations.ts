import { faker } from '@faker-js/faker';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import * as process from 'node:process';
import { env } from '~/env/server.mjs';
import { pgDbWrite } from '~/server/db/pgDb';
import { insertRows } from './gen_seed';

const baseDir = './prisma/migrations';

const getHashForMigration = async (folder: string) => {
  const hash = createHash('sha256');
  const content = await fs.readFile(`./prisma/migrations/${folder}/migration.sql`, 'utf-8');
  hash.update(content);
  return hash.digest('hex');
};

const insertNewMigrations = async (migrations: string[]) => {
  const now = new Date();
  const migrationData: (string | number | null | Date)[][] = [];
  for (const m of migrations) {
    const hash = await getHashForMigration(m);
    migrationData.push([faker.string.uuid(), hash, now, m, null, null, now, 0]);
  }
  await insertRows('_prisma_migrations', migrationData, false);
};

const initialMigrations = [
  '20221011220133_init',
  '20221013171533_add_nsfw',
  '20221013194408_int_keys',
  '20221013203441_cascades',
  '20221013221254_no_optional_user_id',
  '20221013224243_numeric_image_dimensions',
  '20221014182803_metrics_and_saves',
  '20221014212220_add_image_index',
  '20221018202627_add_kv_store',
  '20221018213100_split_model_metrics',
  '20221018215322_optional_model_desc',
  '20221019000757_model_ranks',
  '20221019192339_remove_images_from_model',
  '20221020230242_rating_to_float',
  '20221025225635_user_account_props',
  '20221027230516_username_unique_case_insensitive',
  '20221031222816_image_cascade_on_delete',
  '20221101202142_anonymous_user_activities',
  '20221101230538_add_training_data_download_tracking',
  '20221103193819_add_tos_violation',
  '20221103200953_model_review_reporting',
  '20221103205440_add_moderator',
  '20221103221020_user_tos',
  '20221108145701_cascade_delete_version_metrics_reviews',
  '20221108160217_update_sizekb_tyoe_int_to_float',
  '20221108215007_rank_fix',
  '20221109183328_rank_fix_2',
  '20221109192749_rank_fix_3',
  '20221110180604_trained_words_on_version',
  '20221110222142_temp_verified_model',
  '20221111185845_model_files',
  '20221112015716_scan_request_time',
  '20221112190714_handle_bad_uploads',
  '20221114043025_add_importing',
  '20221114213528_image_meta',
  '20221115210524_add_uniqueness_to_reactions',
  '20221116143356_import_children',
  '20221118203334_add_apikey_table',
  '20221128223635_add_favorite_model_table',
  '20221129184259_favorite_model_metric',
  '20221129201529_update_rank_for_favorites',
  '20221202170057_model_file_format',
  '20221202191101_model_version_index',
  '20221202204857_add_comment_tables',
  '20221202220635_user_link',
  '20221202230223_user_link_index',
  '20221202230448_user_rank',
  '20221203005905_remove_user_link_index',
  '20221205213338_comment_table_update',
  '20221205232721_user_created_date',
  '20221207040459_add_logging',
  '20221207202442_support_inaccurate_report',
  '20221207235134_add_notification_table',
  '20221208022641_run_v1',
  '20221208032821_comment_metrics',
  '20221209162539_add_person_of_interest_toggle',
  '20221209174938_add_unique_constraint_user_notifications',
  '20221209190209_partner_tokens',
  '20221209210146_update_model_file_type',
  '20221212033336_add_model_hash',
  '20221212045320_model_hash_report_support',
  '20221213232706_add_lora',
  '20221214181035_add_modelfile_id',
  '20221214181207_add_model_file_unique',
  '20221215050908_add_webhooks',
  '20221215052358_published_at',
  '20221216163900_last_version_at',
  '20221216173428_report',
  '20221216191451_additional_report_reasons',
  '20221216195329_add_user_engagement',
  '20221216211622_model_report_count',
  '20221219234321_report_manys',
  '20221220044202_add_trending',
  '20221220204300_ranks_as_materialized_views',
  '20221220211549_current_mviews',
  '20221221002209_add_base_model',
  '20221222223841_file_types_as_string',
  '20221223175226_model_type_default',
  '20221223180254_add_tag_target',
  '20221223182642_tag_unique_with_target',
  '20221226174634_question_answers',
  '20221226195245_optional_answer_vote_vote',
  '20221226201249_add_download_history',
  '20221228193154_report_cascading',
  '20221230223422_hash_on_files',
  '20221230234742_review_exclusion',
  '20221231002954_prep_on_demand_partners',
  '20221231224306_break_out_user_rank',
  '20230103185824_display_name',
  '20230105043946_run_strategy_cascades',
  '20230105174251_add_user_preferred_download',
  '20230105180003_revise_rating_rank',
  '20230105194139_remove_model_file_primary_field',
  '20230106181738_defined_commercial_uses',
  '20230106210644_mark_images_nsfw',
  '20230106223259_leaderboard_rank',
  '20230110213544_add_tag_engagment',
  '20230110235012_image_analysis',
  '20230111032437_model_licenses',
  '20230111224629_cascade_model_hash',
  '20230112001351_unique_image_constraint',
  '20230112193222_tag_metrics',
  '20230112234519_unlistable_tags',
  '20230113232730_user_answer_stats',
  '20230117162526_model_engagement',
  '20230117190149_fix_user_cascades',
  '20230118020152_remove_favorites',
  '20230118154709_add_model_early_access_timeframe',
  '20230118195800_add_model_version_early_access_timeframe',
  '20230119185541_add_model_version_engagement',
  '20230120050134_adjust_scanning_enums',
  '20230124192503_soft_delete_model',
  '20230124204854_add_deleted_model_status',
  '20230125214723_model_checkpoint_type',
  '20230125230024_session_invalidation',
  '20230126222352_image_first_class',
  '20230127004457_image_metrics',
  '20230127171929_image_comment_metrics',
  '20230127232300_metric_update_queue',
  '20230130192853_on_demand_types',
  '20230130211031_announcements',
  '20230130224954_comment_lock',
  '20230130231226_adjust_review_cascades',
  '20230131150221_review_lock',
  '20230201143158_mute_users',
  '20230201205224_ban_user',
  '20230202153952_user_cosmetics',
  '20230203224140_stripe',
  '20230207225516_cosmetic_delivery',
  '20230207230114_cosmetic_default_id_fix',
  '20230208211232_report_internal_message',
  '20230209171946_add_model_locked',
  '20230209203015_report_limiting',
  '20230209225221_rename_inaction_unaction',
  '20230210200501_add_iscategory_tag',
  '20230210222835_model_hash_view',
  '20230211012925_subscription_update_date',
  '20230212204953_api_key_tweaks',
  '20230213223732_update_model_new_rank',
  '20230214004943_comment_threads',
  '20230214144643_multiple_tag_target',
  '20230216003413_image_gen_process',
  '20230216033353_image_feature_at',
  '20230217033101_unfeatured_categories',
  '20230217213122_image_needs_review',
  '20230217220241_tag_unique_name',
  '20230220220914_user_activity_index',
  '20230221151809_view_pef_tweaks',
  '20230221230819_user_setting_autoplay_gifs',
  '20230223225028_add_new_types',
  '20230227220233_prep_for_mod_tags',
  '20230303201656_leaderboard_exclude_deleted',
  '20230305040226_account_metadata',
  '20230306181918_model_delete_tracking',
  '20230306211459_model_hash_file_type',
  '20230308010444_posts',
  '20230308161211_post_helper',
  '20230309201953_enhanced_moderation',
  '20230309235349_model_files_preferences',
  '20230310005918_image_size',
  '20230311174603_locon',
  '20230312182841_wildcards',
  '20230313221818_commentv2_reporting',
  '20230315025401_other_type',
  '20230315182114_posts_continued',
  '20230316201031_resource_helpers',
  '20230317181458_user_tagging',
  '20230321212209_optimizations',
  '20230321232309_post_tags',
  '20230322230044_discussion_items',
  '20230323084001_tags_on_tags',
  '20230330165149_top_level_comment_thread',
  '20230405222519_model_status_unpublished_violation',
  '20230407001434_model_version_published_at',
  '20230410221344_resource_review_reports',
  '20230411234137_model_early_access_deadline',
  '20230414200229_model_modifier',
  '20230418020950_model_metrics_daily',
  '20230425180849_nsfw_levels',
  '20230425215834_tag_nsfw_level',
  '20230428002410_mat_views_to_tables',
  '20230511223534_articles',
  '20230511230904_associated_resources',
  '20230515231112_admin_tags',
  '20230517192001_article_attachments',
  '20230517201204_article_engagement',
  '20230517204144_article_metrics',
  '20230518224652_leaderboard_v2',
  '20230522192516_model_type_vae_upscaler',
  '20230522223742_mod_activity',
  '20230605211505_post_report',
  '20230607213943_model_version_exploration',
  '20230608213212_report_user',
  '20230609155557_user_leaderboard_showcase',
  '20230613205927_model_article_association',
  '20230616212538_model_association_nullable',
  '20230619185959_cascade_delete_associations',
  '20230619222230_scheduled_publish',
  '20230620163537_hidden_comments',
  '20230620203240_image_ingestion_status',
  '20230622200840_image_moderation_level',
  '20230622213253_image_engagement',
  '20230623160539_generation_coverage_1',
  '20230626231430_not_null_base_model',
  '20230630171915_model_version_clip_skip',
  '20230704185357_create_search_index_update_queue_table',
  '20230706162241_add_search_index_update_queue_action',
  '20230706163005_add_search_index_update_queue_action_enum',
  '20230712182936_create_collection_related_models',
  '20230712191329_fix_ids_on_collection_tables',
  '20230712203205_add_home_block_type',
  '20230712204937_unlisted_read_config',
  '20230714202551_recommended_vae',
  '20230717203328_add_metadata_to_announcements',
  '20230718193348_add_collection_type',
  '20230719152210_setup_for_collection_review_items',
  '20230719182634_add_collection_write_configuration_review',
  '20230721184738_post_collection_relation',
  '20230726205546_drop_reviews',
  '20230727150451_add_source_to_home_blocks',
  '20230727165302_collection_image',
  '20230728063536_collection_model_metrics',
  '20230728170432_image_type',
  '20230809032747_model_purpose',
  '20230809234333_generation_coverage',
  '20230811054020_nsfw_level_blocked',
  '20230811173920_download_history',
  '20230813154457_adding_training_data',
  '20230818173920_add_workflows',
  '20230824160203_collection_metrics',
  '20230828183133_image_post_collected_count_metrics',
  '20230829142201_add_model_version_monetization_table',
  '20230901221543_rent_civit',
  '20230902054355_paid_generation_option',
  '20230904155529_add_bounty_schema',
  '20230904212207_update_generation_coverage_view',
  '20230904215223_generation_covergae_view_rentcivit',
  '20230906215932_tag_source',
  '20230908201330_computed_tag_source',
  '20230912004157_motion_module',
  '20230912153043_add_bounty_complete',
  '20230912205241_add_bounty_metrics',
  '20230912220022_add_bounty_rank_views',
  '20230913054542_social_homeblock',
  '20230913162225_add_bounty_metric_comment_count',
  '20230914165121_bounty_report',
  '20230914200233_bounty_poi',
  '20230918202805_add_user_referrals',
  '20230918222033_make_user_referral_code_unqye',
  '20230920153125_crate_buzz_tip_table',
  '20230920200843_update_bounty_indexes',
  '20230920211650_add_deleted_at_user_referral_code',
  '20230921142409_add_user_id_index_user_referrals',
  '20230921160043_add_created_updated_at_buzz_tip',
  '20230921161619_add_tipped_amount_on_articles',
  '20230921204323_bounty_entry_description',
  '20230925155218_add_buzz_tip_on_bounty_entry',
  '20230927151024_collection_mode_support',
  '20230928151649_collection_item_random_id',
  '20230928163847_add_datapurged_to_modelfile',
  '20230929145153_collection_item_collection_id_index',
  '20231005123051_bounty_expires_at_starts_at_date_only',
  '20231006205635_comment_v2_hidden',
  '20231013203903_user_onboarding_step',
  '20231019210147_model_version_monetization_buzz_currency',
  '20231024143326_user_referral_code_crated_at',
  '20231025204142_image_scan_job',
  '20231026192053_add_user_profile_schema',
  '20231027024129_require_auth_option',
  '20231027035952_run_partner_base_model',
  '20231027221218_image_view_count',
  '20231031195932_update_user_profile_schema',
  '20231103152012_recommended_resources',
  '20231109061817_model_file_header_data',
  '20231110192419_add_landing_page_to_user_referral',
  '20231110203035_add_login_redirect_reason_to_user_referral',
  '20231110210854_claimable_cosmetics',
  '20231115072331_press_mention',
  '20231118201935_collection_item_reviewed_by',
  '20231121050854_holiday_cosmetics',
  '20231122151806_add_club_related_tables',
  '20231123201130_update_club_entity_table',
  '20231127231440_remove_club_entity_improve_entity_access',
  '20231128212202_add_club_post_cover_image',
  '20231130141155_add_club_membershi_id',
  '20231130143354_remove_buzz_account_id',
  '20231201094437_event_homeblock_type',
  '20231203043804_generation_metrics',
  '20231207201510_add_club_post_thread',
  '20231207204618_user_profile_picture',
  '20231213152614_model_gallery_settings',
  '20231213153118_add_club_admin_support',
  '20231213153829_add_club_tier_member_limit',
  '20231213182603_csam_report',
  '20231218152300_add_unlisted_availability_to_post_entity_id_club_post',
  '20231222015820_notification_split',
  '20231222180336_optional_club_post_title_description',
  '20231223004700_report_type_csam',
  '20240102150617_add_club_post_reactions',
  '20240102154255_add_club_post_metrics',
  '20240102183528_add_club_metrics',
  '20240102211435_add_club_ranks',
  '20240105204334_add_one_time_fee_on_club_tier',
  '20240110183909_add_dm_tables',
  '20240110202344_dm_user_relationship',
  '20240111143445_dm_chat_owner',
  '20240111144730_dm_chat_edited_optional',
  '20240112151626_user_settings',
  '20240113023932_email_citext',
  '20240114174922_add_parent_thread_id_root_thread_id_on_threads',
  '20240117150305_add_ignored_to_chat_enum',
  '20240118213143_tags_on_tags_type',
  '20240118214315_muted_at',
  '20240119175458_buzz_claim',
  '20240119204734_muted_at_trigger',
  '20240121232802_buzz_claim_details',
  '20240123173456_article_cover_id',
  '20240125153716_add_user_stripe_connect_status',
  '20240125182002_add_unique_on_conected_account_id',
  '20240126153602_add_chat_report',
  '20240129152539_add_buzz_withdrawal_requeests_tables',
  '20240129203835_add_model_availability',
  '20240206222015_nsfw_level_2',
  '20240207190207_notification_category',
  '20240207200350_tags_on_image_vote_applied',
  '20240208212306_user_updates',
  '20240209213025_build_guide',
  '20240212151513_add_buzz_withdrawal_status_externally_resolved',
  '20240213195536_additional_notification_categories',
  '20240213205914_nsfw_levels',
  '20240217005100_partner_tier',
  '20240219150315_collection_data_structure_improvements',
  '20240220184546_partner_logo',
  '20240220204643_resource_review_recommended_system',
  '20240221203954_model_commercial_user_array',
  '20240221204751_add_purchasable_rewards_schema',
  '20240227203510_add_vault_schema',
  '20240229155733_vault_item_update_field',
  '20240305191909_vault_item_improvement_schema_changes',
  '20240307231126_nsfw_level_update_queue',
  '20240308194924_vault_item_meta_field',
  '20240312143533_vault_item_files_as_json',
  '20240312210710_vault_item_indexes',
  '20240313071941_metric_updated_at',
  '20240321152907_image_resource_strength',
  '20240325234311_image_rating_request',
  '20240326201017_cosmetic_shop_tables',
  '20240327194537_redeemable_code',
  '20240329072855_add_dora',
  '20240403142806_add_cosmetic_type_profile_decoration',
  '20240405133543_dms_add_more_content_type',
  '20240409152606_add_cosmetic_reference_to_item',
  '20240409202625_add_shop_item_unit_amount',
  '20240411155123_make_image_optional',
  '20240411185822_add_cosmetic_type_profile_background',
  '20240418202619_add_for_id_user_cosmetic',
  '20240419174913_image_tools',
  '20240423150723_add_user_public_settings',
  '20240430033247_user_metric_reactions',
  '20240504220623_file_override_name',
  '20240508215105_image_techniques',
  '20240509145855_add_domain_to_tool',
  '20240516171837_add_editor_to_tooltype',
  '20240520214941_early_access_v2',
  '20240524211244_add_training_statuses',
  '20240528185514_early_access_v2_nits',
  '20240528212836_muted_confirmed',
  '20240528220022_exclude_from_leaderboards',
  '20240603200922_tool_priority',
  '20240604172025_api_key_type',
  '20240606185927_tool_description',
  '20240610185726_add_minor_field',
  '20240613183520_csam_report_type',
  '20240613215736_collection_item_tag_id',
  '20240617215459_entity_collaborator',
  '20240619092115_reward_eligibility',
  '20240619152041_entity_collaborator_last_message_sent_at',
  '20240619181506_add_video_url',
  '20240619185235_add_video_url_to_cosmetic_shop_item',
  '20240620155119_user_engagement_type_block',
  '20240620165739_rollback_add_video_url_cosmetic_shop_item',
  '20240624134110_tool_metadata',
  '20240719172747_add_published_to_image_and_trigger',
  '20240724182718_add_entity_metrics',
  '20240725040405_simplify_run_strat',
  '20240729233040_image_block',
  '20240808220734_ad_token_table',
  '20240809155038_add_paddle_customer_id',
  '20240809230424_tag_source_image_hash',
  '20240812183927_hamming_distance_function',
  '20240815210353_add_payment_providers',
  '20240830173458_add_upload_type_to_mv',
  '20240911095200_query_improvements',
  '20240915215614_image_flag',
  '20240926213438_model_scanned_at_column',
  '20240930191432_add_cosmetic_shop_home_block_type',
  '20240930192521_model_flag_details_column',
  '20241003192438_model_flag_poi_name_column',
];

async function main() {
  if (!env.DATABASE_URL.includes('localhost:15432')) {
    console.error('ERROR: not running with local database server.');
    process.exit(1);
  }

  const alreadyRunQuery = await pgDbWrite.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations" where finished_at is not null`
  );

  let alreadyRun: string[];
  if (!alreadyRunQuery.rows.length) {
    await insertNewMigrations(initialMigrations);
    alreadyRun = initialMigrations;
  } else {
    alreadyRun = alreadyRunQuery.rows.map((r) => r.migration_name);
  }

  const folders = await fs.readdir(baseDir, { withFileTypes: true });
  const newMigrations: string[] = [];
  const failedMigrations: string[] = [];

  for (const folder of folders) {
    if (folder.isDirectory()) {
      try {
        if (!alreadyRun.includes(folder.name)) {
          const content = await fs.readFile(`${baseDir}/${folder.name}/migration.sql`, 'utf-8');
          console.log(`Applying ${folder.name}...`);
          await pgDbWrite.query(content);
          newMigrations.push(folder.name);
        }
      } catch (err) {
        console.error(err);
        failedMigrations.push(folder.name);
      }
    }
  }

  if (newMigrations.length > 0) {
    await insertNewMigrations(newMigrations);
  }

  if (newMigrations.length || failedMigrations.length) {
    console.log('--------------------');
    console.log(`Finished migrations.`);
    console.log(`Successes: ${newMigrations.length}.`);
    console.log(`Failures: ${failedMigrations.length}.`);
  } else {
    console.log('Up to date.');
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  });
}
