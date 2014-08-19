select course.*,class.grade_year,ifi_date.start_time,ifi_date.end_time
from course 
join tag_course on course.id = tag_course.ref_course_id
join class on course.ref_class_id = class.id
join $ischool_fitness_input_date as ifi_date on ifi_date.grade_year = class.grade_year
where tag_course.ref_tag_id in ( select id from tag where category = 'Course' and name = 'Åé¨|' )
and course.ref_teacher_id = $input and semster = $input and school_year = $input



select isf.*
from $ischool_student_fitness as isf
join sc_attend on isf.ref_student_id = sc_attend.id
join course on sc_attend.ref_course_id = course.id
where student.ref_class_id = $input and course.ref_teacher_id = $input


update $ischool_student_fitness set sit_and_reach = $input,... where id = $input
insert into $ischool_student_fitness ( ) values ( )

pkey
ref_student_id
school_year default:current_school_year
test_date default:empty

school_category ?
