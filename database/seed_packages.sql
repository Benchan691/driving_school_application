-- Seed packages with correct data from frontend packages.json

INSERT INTO lesson_packages (
  name, description, number_of_lessons, price, original_price, 
  duration_hours, package_type, is_popular, features
) VALUES 
(
  '1 Hour Driving Lesson',
  'One lesson, to evaluate and prepare for your road test',
  1, 80.00, 110.00, 1.0, 'single', false,
  '["One lesson evaluation", "Road test preparation", "Individual assessment"]'::json
),
(
  '1.5 Hours Driving Lessons',
  'Perfect for intermediate or experienced drivers wanting a reminder of driving skills',
  1, 110.00, 150.00, 1.5, 'single', false,
  '["Perfect for intermediate drivers", "Experienced driver refresher", "Reminder of driving skills"]'::json
),
(
  'Package A',
  'In this package you will get four 90 minutes lessons. Total hours 6 behind the wheel.',
  4, 420.00, 600.00, 6.0, 'package', true,
  '["Four 90-minute lessons", "Total 6 hours behind the wheel", "Comprehensive training"]'::json
),
(
  'Package B',
  'In this package you will get six 90 minutes lessons. Total hours 9 behind the wheel.',
  6, 610.00, 1000.00, 9.0, 'package', false,
  '["Six 90-minute lessons", "Total 9 hours behind the wheel", "Extended training program"]'::json
),
(
  'Package C',
  'In this package you will get ten 90 minutes lessons. Total hours 15 behind the wheel.',
  10, 1000.00, 1800.00, 15.0, 'package', false,
  '["Ten 90-minute lessons", "Total 15 hours behind the wheel", "Comprehensive training program"]'::json
),
(
  'Road Test',
  'In this package you will get 60 minutes refresher lesson and a school vehicle for road testing.',
  1, 170.00, 220.00, 1.0, 'road_test', true,
  '["60 minutes refresher lesson", "School vehicle for road testing", "Complete road test support"]'::json
);

