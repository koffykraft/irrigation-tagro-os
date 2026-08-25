window.TAGROProductMediaSources = {
  contract: 'tagro-jain-product-media-sources-v1',
  status: 'IMAGE_ASSETS_AVAILABLE_PARTIAL',
  rule: 'Product media is a presentation/evidence projection. Product images and sales copy may not override engineering requirements, manufacturer evidence, price provenance or stock truth.',
  source_root: '/jain-irrigation-agent/Product Files_JAIN',
  products: [
    {
      key: 'j-sc-pc-plus',
      knowledge_id: 'jain:j-sc-pc-plus',
      name: 'J-SC PC Plus',
      official_name: 'J-SC PC-Plus Emitter',
      family: 'pressure_compensating_online_emitter',
      source_pdf: 'jain_drip/Emitters/J_SC_PC_Plus.pdf',
      source_archive: 'Jain_Irrigation_Drip_Product_Portfolio_v1.zip',
      image_archive: 'jain_drip_images.zip',
      image_asset: './assets/jain-products-web/j-sc-pc-plus.png',
      pitch: {
        label: 'Pressure-compensating · take-apart emitter',
        short: 'A serviceable PC emitter for jobs where pressure variation, terrain or longer runs make uniform discharge more valuable.',
        facts: ['2.2 / 4.2 / 8.2 LPH', '0.8–3.0 kg/cm²', '130 micron filtration', 'Take-apart · self-cleaning'],
        good_for: ['Orchards and fruit crops', 'Undulating or sloping ground', 'Longer lateral runs', 'Nursery / greenhouse uses'],
        watch: 'Do not pay for pressure compensation merely because it is available. On a short, level run a simpler emitter may be sufficient.',
        compare: { type: 'PC, take-apart', pressure: '0.8–3.0 kg/cm²', discharge: '2.2 / 4.2 / 8.2 LPH', service: 'Can be opened/cleaned', terrain: 'Strong candidate when pressure varies' }
      }
    },
    {
      key: 'j-loc',
      knowledge_id: 'jain:j-loc',
      name: 'J-Loc Emitter',
      official_name: 'J-Loc Emitter',
      family: 'take_apart_online_emitter',
      source_pdf: 'jain_drip/Emitters/J Loc Emitter.pdf',
      source_archive: 'Jain_Irrigation_Drip_Product_Portfolio_v1.zip',
      image_archive: 'jain_drip_images.zip',
      image_asset: './assets/jain-products-web/j-loc.png',
      pitch: {
        label: 'Take-apart online emitter',
        short: 'A simple serviceable online emitter that can suit tree crops where several outlet points around the root zone are useful.',
        facts: ['2 / 4 / 8 / 15 LPH', 'Nominal 1.0 kg/cm²', '130 micron filtration', 'Take-apart · non-PC'],
        good_for: ['Fruit orchards', 'Multiple emitters around a tree', 'Simple online drip layouts', 'Horizontal or vertical installation'],
        watch: 'It is not pressure compensating. Pressure variation across the field still has to be checked; the 15 LPH option especially needs lateral-flow review.',
        compare: { type: 'Non-PC, take-apart', pressure: 'Nominal 1.0 kg/cm²', discharge: '2 / 4 / 8 / 15 LPH', service: 'Can be opened/cleaned', terrain: 'Best compared carefully when pressure varies' }
      }
    },
    {
      key: 'turbo-pc',
      knowledge_id: 'jain:turbo-pc',
      name: 'Turbo PC',
      official_name: 'Turbo PC',
      family: 'online_pc_emitter',
      source_pdf: 'jain_drip/Emitters/turbo pc.pdf',
      source_archive: 'Jain_Irrigation_Drip_Product_Portfolio_v1.zip',
      image_archive: 'jain_drip_images.zip',
      image_asset: './assets/jain-products-web/turbo-pc.png',
      pitch: {
        label: 'PC / PCNL online emitter',
        short: 'A broad-range pressure-compensating emitter family, including a non-leakage option for pulse-style applications.',
        facts: ['2 / 4 / 8 / 24 LPH', '0.5–4.0 kg/cm²', '120 mesh / 130 micron', 'PC and PCNL variants'],
        good_for: ['Orchards and vineyards', 'Harsh or undulating topography', 'Pulse irrigation / PCNL use', 'Greenhouse and nursery applications'],
        watch: 'PC does not remove the need for hydraulic sizing or filtration. Compare the added complexity/cost with the actual pressure variation and required discharge.',
        compare: { type: 'PC / PCNL, sealed', pressure: '0.5–4.0 kg/cm²', discharge: '2 / 4 / 8 / 24 LPH', service: 'Factory sealed', terrain: 'Broad pressure range; useful on variable terrain' }
      }
    },
    {
      key: 'jain-jet',
      name: 'Jain Jet',
      family: 'micro_jet',
      source_pdf: 'jain_micro_mini_sprinklers/Jets/Jain Jet.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'modular-sprinkler',
      name: 'Modular Sprinkler',
      family: 'micro_sprinkler_micro_jet',
      source_pdf: 'jain_micro_mini_sprinklers/Micro Sprinklers/Modular Sprinkler.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'j-mini-sprinkler',
      name: 'J Mini Sprinkler',
      family: 'mini_sprinkler',
      source_pdf: 'jain_micro_mini_sprinklers/Micro Sprinklers/J Mini Sprinkler.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'acurain-opal',
      name: 'Acurain Opal',
      family: 'under_tree_sprinkler',
      source_pdf: 'jain_micro_mini_sprinklers/Under Tree Systems/Opal.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'j-bubbler-pc',
      name: 'J-Bubbler PC',
      family: 'pressure_compensating_bubbler',
      source_pdf: 'jain_micro_mini_sprinklers/Bubblers/J Bubbler PC.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'jain-fogger',
      name: 'Jain Fogger',
      family: 'fogger',
      source_pdf: 'jain_micro_mini_sprinklers/Foggers/Jain Fogger.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'acu-mister',
      name: 'Acu-Mister',
      family: 'mister',
      source_pdf: 'jain_micro_mini_sprinklers/Misters/Acu Mister.pdf',
      source_archive: 'Jain_Irrigation_Micro_Mini_Sprinklers_Portfolio_v1.zip',
      image_asset: null
    },
    {
      key: 'jain-ghoomar',
      name: 'Jain Ghoomar',
      family: 'sand_separator',
      source_pdf: 'jain_drip/Filters/Jain Ghoomar.pdf',
      source_archive: 'Jain_Irrigation_Drip_Product_Portfolio_v1.zip',
      image_archive: 'jain_drip_images.zip',
      image_asset: null
    },
    {
      key: 'spin-clean-disc-filter',
      name: 'Spin Clean Disc Filter',
      family: 'hydrocyclone_disc_combination_filter',
      source_pdf: 'jain_drip/Filters/Spinclean_Disc_Filter.pdf',
      source_archive: 'Jain_Irrigation_Drip_Product_Portfolio_v1.zip',
      image_archive: 'jain_drip_images.zip',
      image_asset: null
    },
    {
      key: 'venturi-injector',
      name: 'Venturi Injector',
      family: 'fertilizer_injector_venturi',
      source_pdf: 'jain_dosing/Fertilizer Injectors/Venturi_Injector.pdf',
      source_archive: 'Jain_Irrigation_Dosing_Pumps_Injectors_Portfolio_v1.zip',
      image_asset: null
    }
  ]
};
