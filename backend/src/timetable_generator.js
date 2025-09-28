class TimetableGenerator {
  constructor() {
    // JavaScript-only implementation
  }

  async generateMasterTimetable(subjects, rooms, faculty, constraints) {
    // JavaScript-based timetable generation with improved distribution
    
    try {
      console.log('Generating timetable using JavaScript implementation...');
      
      const days = 5;
      const slotsPerDay = 8;
      
      // Initialize empty timetable
      const timetable = [];
      for (let day = 0; day < days; day++) {
        const daySlots = [];
        for (let slot = 0; slot < slotsPerDay; slot++) {
          daySlots.push([]);
        }
        timetable.push(daySlots);
      }
      
      const scheduleData = [];
      const subjectNames = Object.keys(subjects);
      const roomNames = Object.keys(rooms);
      
      // Better distribution algorithm - spread subjects across days and periods
      const availableSlots = [];
      for (let day = 0; day < days; day++) {
        for (let period = 0; period < slotsPerDay; period++) {
          // Skip lunch break (period 4 = 1:00-2:00 PM)
          if (period !== 4) {
            availableSlots.push({ day, period });
          }
        }
      }
      
      // Shuffle available slots for better distribution
      for (let i = availableSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
      }
      
      // Track used instructor-time combinations to avoid conflicts
      const instructorSchedule = new Map();
      
      let slotIndex = 0;
      subjectNames.forEach((subjectName, index) => {
        const subject = subjects[subjectName];
        
        if (slotIndex < availableSlots.length) {
          const { day, period } = availableSlots[slotIndex];
          const room = roomNames[index % roomNames.length];
          const instructorKey = `${subject.instructor_id}-${day}-${period}`;
          
          // Skip if instructor already has a class at this time
          if (!instructorSchedule.has(instructorKey)) {
            instructorSchedule.set(instructorKey, true);
            
            const entry = {
              subject: subjectName,
              course_code: subject.course_code || subjectName,
              instructor: subject.instructor_name || 'TBA',
              instructor_id: subject.instructor_id,
              room: room,
              day: day,
              period: period,
              time_slot: period
            };
            
            scheduleData.push(entry);
            
            // For the timetable grid, store the entry object
            timetable[day][period] = [{
              course_code: subject.course_code || subjectName,
              instructor: subject.instructor_name || 'TBA',
              room: room,
              slot_type: subject.course_type === 'Lab' ? 'lab' : 'theory'
            }];
            
            slotIndex++;
          }
        }
      });
      
      console.log(`Generated ${scheduleData.length} scheduled classes`);
      
      return {
        success: true,
        timetable: timetable,
        schedule_data: scheduleData,
        message: `Timetable generated successfully with ${scheduleData.length} scheduled classes`
      };
      
    } catch (error) {
      console.error('JavaScript timetable generation error:', error);
      return {
        success: false,
        message: `Error generating timetable: ${error.message}`
      };
    }
  }

  generateStudentTimetable(masterTimetable, studentId, enrolledSubjects) {
    const studentTimetable = [];
    
    // Initialize empty timetable grid
    for (let day = 0; day < 5; day++) {
      studentTimetable[day] = [];
      for (let slot = 0; slot < 8; slot++) {
        studentTimetable[day][slot] = null;
      }
    }

    // Fill student timetable based on enrolled subjects
    masterTimetable.forEach((daySchedule, dayIndex) => {
      daySchedule.forEach((slotContent, slotIndex) => {
        if (slotContent && slotContent.length > 0) {
          slotContent.forEach(entry => {
            const courseMatch = entry.match(/^([A-Z_]+)/);
            if (courseMatch && enrolledSubjects.includes(courseMatch[1])) {
              studentTimetable[dayIndex][slotIndex] = entry;
            }
          });
        }
      });
    });

    return studentTimetable;
  }

  generateStaffTimetable(masterTimetable, facultyName) {
    const staffTimetable = [];
    
    // Initialize empty timetable grid
    for (let day = 0; day < 5; day++) {
      staffTimetable[day] = [];
      for (let slot = 0; slot < 8; slot++) {
        staffTimetable[day][slot] = null;
      }
    }

    // Fill staff timetable based on faculty assignments
    masterTimetable.forEach((daySchedule, dayIndex) => {
      daySchedule.forEach((slotContent, slotIndex) => {
        if (slotContent && slotContent.length > 0) {
          slotContent.forEach(entry => {
            if (entry.includes(facultyName)) {
              staffTimetable[dayIndex][slotIndex] = entry;
            }
          });
        }
      });
    });

    return staffTimetable;
  }
}

module.exports = TimetableGenerator;