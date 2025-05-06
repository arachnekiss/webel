/**
 * Script to seed multilingual data for testing the search feature
 * 
 * This script adds multilingual resources and services to test the search
 * functionality across different languages (Korean, English, Japanese, 
 * Chinese, and Spanish).
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const ws = require('ws');

// Configure for serverless environment
dotenv.config();
neonConfig.webSocketConstructor = ws;

// Connect to the database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Multilingual test resources data
const multilingualResources = [
  // Korean resources
  {
    title: '오픈 소스 소프트웨어 개발 가이드',
    description: '누구나 쉽게 오픈 소스 프로젝트에 기여할 수 있는 방법을 알려드립니다. 엔지니어링 기초부터 고급 기술까지 다룹니다.',
    category: 'software',
    tags: ['오픈소스', '소프트웨어개발', '엔지니어링', '프로그래밍'],
    image_url: 'https://example.com/images/opensource_ko.jpg',
    thumbnail_url: 'https://example.com/thumbnails/opensource_ko.jpg',
    download_count: 128,
    how_to_use: '이 가이드를 다운로드하고 README.md 파일을 먼저 읽어보세요.',
  },
  {
    title: '3D 프린팅 기초 모델 모음',
    description: '3D 프린팅을 시작하는 분들을 위한 기초 모델 세트입니다. 다양한 난이도의 모델이 포함되어 있습니다.',
    category: '3d_model',
    tags: ['3D프린팅', '모델링', '기초학습', '메이커'],
    image_url: 'https://example.com/images/3dprinting_ko.jpg',
    thumbnail_url: 'https://example.com/thumbnails/3dprinting_ko.jpg',
    download_count: 245,
    how_to_use: 'STL 파일을 다운로드하고 슬라이싱 소프트웨어에서 열어 인쇄하세요.',
  },
  
  // English resources
  {
    title: 'Comprehensive Guide to Software Engineering',
    description: 'Learn the fundamentals and advanced concepts of software engineering. Includes best practices for professional development.',
    category: 'software',
    tags: ['engineering', 'software development', 'programming', 'computer science'],
    image_url: 'https://example.com/images/software_eng.jpg',
    thumbnail_url: 'https://example.com/thumbnails/software_eng.jpg',
    download_count: 302,
    how_to_use: 'Download the PDF and follow the step-by-step tutorials included in the guide.',
  },
  {
    title: 'Open Source Hardware Designs Collection',
    description: 'A collection of open source hardware designs ready for manufacturing. Includes PCB layouts and schematics.',
    category: 'hardware_design',
    tags: ['open source', 'hardware', 'PCB', 'electronics'],
    image_url: 'https://example.com/images/hardware_designs.jpg',
    thumbnail_url: 'https://example.com/thumbnails/hardware_designs.jpg',
    download_count: 178,
    how_to_use: 'Download the design files and open them in your preferred PCB design software.',
  },
  
  // Japanese resources
  {
    title: 'オープンソースソフトウェア開発ガイド',
    description: 'オープンソースプロジェクトに誰でも簡単に貢献できる方法を紹介します。エンジニアリングの基礎から高度な技術までカバーします。',
    category: 'software',
    tags: ['オープンソース', 'ソフトウェア開発', 'エンジニアリング', 'プログラミング'],
    image_url: 'https://example.com/images/opensource_ja.jpg',
    thumbnail_url: 'https://example.com/thumbnails/opensource_ja.jpg',
    download_count: 94,
    how_to_use: 'このガイドをダウンロードして、まずREADME.mdファイルをお読みください。',
  },
  {
    title: '3Dプリンター用モデルコレクション',
    description: '3Dプリンティングを始める方のための基本モデルセットです。さまざまな難易度のモデルが含まれています。',
    category: '3d_model',
    tags: ['3Dプリンティング', 'モデリング', '初心者向け', 'メーカー'],
    image_url: 'https://example.com/images/3dprinting_ja.jpg',
    thumbnail_url: 'https://example.com/thumbnails/3dprinting_ja.jpg',
    download_count: 156,
    how_to_use: 'STLファイルをダウンロードし、スライシングソフトウェアで開いて印刷してください。',
  },
  
  // Chinese resources
  {
    title: '开源软件开发指南',
    description: '告诉您如何轻松为开源项目做出贡献。涵盖从工程基础到高级技术的内容。',
    category: 'software',
    tags: ['开源', '软件开发', '工程', '编程'],
    image_url: 'https://example.com/images/opensource_zh.jpg',
    thumbnail_url: 'https://example.com/thumbnails/opensource_zh.jpg',
    download_count: 117,
    how_to_use: '下载此指南并首先阅读README.md文件。',
  },
  {
    title: '3D打印基础模型集合',
    description: '为3D打印初学者准备的基础模型集。包含各种难度级别的模型。',
    category: '3d_model',
    tags: ['3D打印', '建模', '基础学习', '创客'],
    image_url: 'https://example.com/images/3dprinting_zh.jpg',
    thumbnail_url: 'https://example.com/thumbnails/3dprinting_zh.jpg',
    download_count: 189,
    how_to_use: '下载STL文件并在切片软件中打开以进行打印。',
  },
  
  // Spanish resources
  {
    title: 'Guía para el Desarrollo de Software de Código Abierto',
    description: 'Aprenda cómo cualquiera puede contribuir fácilmente a proyectos de código abierto. Cubre desde fundamentos de ingeniería hasta técnicas avanzadas.',
    category: 'software',
    tags: ['código abierto', 'desarrollo de software', 'ingeniería', 'programación'],
    image_url: 'https://example.com/images/opensource_es.jpg',
    thumbnail_url: 'https://example.com/thumbnails/opensource_es.jpg',
    download_count: 104,
    how_to_use: 'Descargue esta guía y lea primero el archivo README.md.',
  },
  {
    title: 'Colección de Modelos Básicos para Impresión 3D',
    description: 'Un conjunto de modelos básicos para aquellos que comienzan con la impresión 3D. Incluye modelos de varios niveles de dificultad.',
    category: '3d_model',
    tags: ['impresión 3D', 'modelado', 'aprendizaje básico', 'creador'],
    image_url: 'https://example.com/images/3dprinting_es.jpg',
    thumbnail_url: 'https://example.com/thumbnails/3dprinting_es.jpg',
    download_count: 132,
    how_to_use: 'Descargue los archivos STL y ábralos en su software de corte para imprimir.',
  },
];

// Multilingual test services data
const multilingualServices = [
  // Korean services
  {
    user_id: 1,
    title: '전문 소프트웨어 엔지니어링 서비스',
    description: '웹, 모바일, 데스크톱 애플리케이션 개발을 위한 전문 소프트웨어 엔지니어링 서비스를 제공합니다.',
    service_type: 'engineer',
    tags: ['소프트웨어', '엔지니어링', '개발', '프로그래밍'],
    location: { address: '서울시 강남구', latitude: 37.5172, longitude: 127.0473 },
    rating: 4.8,
    rating_count: 24,
    image_url: 'https://example.com/images/sw_engineering_ko.jpg',
    contact_email: 'engineer@example.co.kr',
    is_remote: true,
    hourly_rate: 50000,
  },
  {
    user_id: 1,
    title: '3D 프린팅 서비스',
    description: '고품질 3D 프린팅 서비스를 제공합니다. FDM 및 SLA 프린팅 모두 가능합니다.',
    service_type: '3d_printing',
    tags: ['3D프린팅', '프로토타입', '모델링', '제조'],
    location: { address: '부산시 해운대구', latitude: 35.1631, longitude: 129.1639 },
    rating: 4.6,
    rating_count: 18,
    image_url: 'https://example.com/images/3d_printing_ko.jpg',
    printer_model: 'Prusa i3 MK3S+',
    contact_email: 'print@example.co.kr',
    is_remote: false,
    price_per_unit: 15000,
    pricing_unit: 'hour',
  },
  
  // English services
  {
    user_id: 1,
    title: 'Professional Software Engineering Services',
    description: 'Providing expert software engineering services for web, mobile, and desktop application development.',
    service_type: 'engineer',
    tags: ['software', 'engineering', 'development', 'programming'],
    location: { address: 'New York, NY', latitude: 40.7128, longitude: -74.0060 },
    rating: 4.9,
    rating_count: 32,
    image_url: 'https://example.com/images/sw_engineering_en.jpg',
    contact_email: 'engineer@example.com',
    is_remote: true,
    hourly_rate: 75,
  },
  {
    user_id: 1,
    title: '3D Printing Service',
    description: 'High-quality 3D printing service available. Both FDM and SLA printing options.',
    service_type: '3d_printing',
    tags: ['3D printing', 'prototyping', 'modeling', 'manufacturing'],
    location: { address: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298 },
    rating: 4.7,
    rating_count: 26,
    image_url: 'https://example.com/images/3d_printing_en.jpg',
    printer_model: 'Prusa i3 MK3S+',
    contact_email: 'print@example.com',
    is_remote: false,
    price_per_unit: 25,
    pricing_unit: 'hour',
  },
  
  // Japanese services
  {
    user_id: 1,
    title: 'プロフェッショナルソフトウェアエンジニアリングサービス',
    description: 'ウェブ、モバイル、デスクトップアプリケーション開発のための専門的なソフトウェアエンジニアリングサービスを提供します。',
    service_type: 'engineer',
    tags: ['ソフトウェア', 'エンジニアリング', '開発', 'プログラミング'],
    location: { address: '東京都渋谷区', latitude: 35.6581, longitude: 139.7017 },
    rating: 4.8,
    rating_count: 21,
    image_url: 'https://example.com/images/sw_engineering_ja.jpg',
    contact_email: 'engineer@example.jp',
    is_remote: true,
    hourly_rate: 6000,
  },
  {
    user_id: 1,
    title: '3Dプリンティングサービス',
    description: '高品質な3Dプリンティングサービスを提供します。FDMとSLAの両方のプリントが可能です。',
    service_type: '3d_printing',
    tags: ['3Dプリンティング', 'プロトタイピング', 'モデリング', '製造'],
    location: { address: '大阪府大阪市', latitude: 34.6937, longitude: 135.5023 },
    rating: 4.6,
    rating_count: 15,
    image_url: 'https://example.com/images/3d_printing_ja.jpg',
    printer_model: 'Prusa i3 MK3S+',
    contact_email: 'print@example.jp',
    is_remote: false,
    price_per_unit: 2000,
    pricing_unit: 'hour',
  },
  
  // Chinese services
  {
    user_id: 1,
    title: '专业软件工程服务',
    description: '提供用于Web、移动和桌面应用程序开发的专业软件工程服务。',
    service_type: 'engineer',
    tags: ['软件', '工程', '开发', '编程'],
    location: { address: '北京市海淀区', latitude: 39.9602, longitude: 116.3033 },
    rating: 4.7,
    rating_count: 19,
    image_url: 'https://example.com/images/sw_engineering_zh.jpg',
    contact_email: 'engineer@example.cn',
    is_remote: true,
    hourly_rate: 500,
  },
  {
    user_id: 1,
    title: '3D打印服务',
    description: '提供高质量的3D打印服务。可用FDM和SLA打印选项。',
    service_type: '3d_printing',
    tags: ['3D打印', '原型制作', '建模', '制造'],
    location: { address: '上海市浦东新区', latitude: 31.2232, longitude: 121.5392 },
    rating: 4.5,
    rating_count: 17,
    image_url: 'https://example.com/images/3d_printing_zh.jpg',
    printer_model: 'Prusa i3 MK3S+',
    contact_email: 'print@example.cn',
    is_remote: false,
    price_per_unit: 150,
    pricing_unit: 'hour',
  },
  
  // Spanish services
  {
    user_id: 1,
    title: 'Servicios Profesionales de Ingeniería de Software',
    description: 'Ofrecemos servicios especializados de ingeniería de software para el desarrollo de aplicaciones web, móviles y de escritorio.',
    service_type: 'engineer',
    tags: ['software', 'ingeniería', 'desarrollo', 'programación'],
    location: { address: 'Madrid, España', latitude: 40.4168, longitude: -3.7038 },
    rating: 4.8,
    rating_count: 23,
    image_url: 'https://example.com/images/sw_engineering_es.jpg',
    contact_email: 'engineer@example.es',
    is_remote: true,
    hourly_rate: 45,
  },
  {
    user_id: 1,
    title: 'Servicio de Impresión 3D',
    description: 'Servicio de impresión 3D de alta calidad disponible. Opciones de impresión FDM y SLA.',
    service_type: '3d_printing',
    tags: ['impresión 3D', 'prototipado', 'modelado', 'fabricación'],
    location: { address: 'Barcelona, España', latitude: 41.3874, longitude: 2.1686 },
    rating: 4.7,
    rating_count: 20,
    image_url: 'https://example.com/images/3d_printing_es.jpg',
    printer_model: 'Prusa i3 MK3S+',
    contact_email: 'print@example.es',
    is_remote: false,
    price_per_unit: 30,
    pricing_unit: 'hour',
  },
];

// Function to insert resources
async function insertResources() {
  try {
    console.log('Inserting multilingual resources...');
    
    for (const resource of multilingualResources) {
      // Insert resource with proper PostgreSQL array format for tags
      const result = await pool.query(
        `INSERT INTO resources (
          title, description, category, tags, image_url, thumbnail_url,
          download_count, how_to_use, created_at
        ) VALUES ($1, $2, $3, $4::text[], $5, $6, $7, $8, NOW())
        RETURNING id`,
        [
          resource.title,
          resource.description,
          resource.category,
          resource.tags,
          resource.image_url,
          resource.thumbnail_url,
          resource.download_count,
          resource.how_to_use
        ]
      );
      
      console.log(`Added resource: ${resource.title} with ID ${result.rows[0].id}`);
    }
    
    console.log('All resources inserted successfully.');
  } catch (error) {
    console.error('Error inserting resources:', error);
  }
}

// Function to insert services
async function insertServices() {
  try {
    console.log('Inserting multilingual services...');
    
    for (const service of multilingualServices) {
      // Insert service with proper PostgreSQL array format for tags
      const result = await pool.query(
        `INSERT INTO services (
          user_id, title, description, service_type, tags, location,
          rating, rating_count, image_url, printer_model, contact_email,
          is_remote, hourly_rate, price_per_unit, pricing_unit, created_at
        ) VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        RETURNING id`,
        [
          service.user_id,
          service.title,
          service.description,
          service.service_type,
          service.tags,
          JSON.stringify(service.location),
          service.rating,
          service.rating_count,
          service.image_url,
          service.printer_model || null,
          service.contact_email,
          service.is_remote,
          service.hourly_rate || null,
          service.price_per_unit || null,
          service.pricing_unit || null
        ]
      );
      
      console.log(`Added service: ${service.title} with ID ${result.rows[0].id}`);
    }
    
    console.log('All services inserted successfully.');
  } catch (error) {
    console.error('Error inserting services:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting multilingual data seeding...');
    
    // Insert resources and services
    await insertResources();
    await insertServices();
    
    console.log('Multilingual data seeding completed successfully.');
  } catch (error) {
    console.error('Error in multilingual data seeding:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Execute the main function
main();