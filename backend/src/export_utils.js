const XLSX = require('xlsx');

class ExportUtils {
  // Generate Excel file for timetable data
  static generateExcelTimetable(timetableData, type = 'master', metadata = {}) {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Create main timetable sheet
      const timetableSheet = this.createTimetableSheet(timetableData, type, metadata);
      XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable');
      
      // Create schedule data sheet if available
      if (timetableData.schedule_data && timetableData.schedule_data.length > 0) {
        const scheduleSheet = this.createScheduleSheet(timetableData.schedule_data);
        XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule Details');
      }
      
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return buffer;
      
    } catch (error) {
      console.error('Error generating Excel file:', error);
      throw new Error('Failed to generate Excel file');
    }
  }
  
  static createTimetableSheet(timetableData, type, metadata) {
    const timeSlots = [
      '9:00-10:00',
      '10:00-11:00', 
      '11:00-12:00',
      '12:00-1:00',
      '1:00-2:00 (LUNCH)',
      '2:00-3:00',
      '3:00-4:00',
      '4:00-5:00'
    ];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Create header with metadata
    const wsData = [];
    
    // Add title and metadata
    wsData.push([`${type.charAt(0).toUpperCase() + type.slice(1)} Timetable`]);
    wsData.push([]);
    
    if (metadata.name) {
      wsData.push([`Name: ${metadata.name}`]);
    }
    if (metadata.department) {
      wsData.push([`Department: ${metadata.department}`]);
    }
    if (metadata.semester) {
      wsData.push([`Semester: ${metadata.semester}`]);
    }
    wsData.push([`Generated on: ${new Date().toLocaleDateString()}`]);
    wsData.push([]);
    
    // Create timetable header
    const headerRow = ['Time'];
    days.forEach(day => headerRow.push(day));
    wsData.push(headerRow);
    
    // Fill timetable data
    timeSlots.forEach((timeSlot, slotIndex) => {
      const row = [timeSlot];
      
      days.forEach((day, dayIndex) => {
        let cellContent = '';
        
        if (slotIndex === 4) { // Lunch break
          cellContent = 'LUNCH BREAK';
        } else {
          const actualSlotIndex = slotIndex > 4 ? slotIndex - 1 : slotIndex;
          
          if (timetableData.timetable && 
              timetableData.timetable[dayIndex] && 
              timetableData.timetable[dayIndex][actualSlotIndex]) {
            
            const slotData = timetableData.timetable[dayIndex][actualSlotIndex];
            
            if (Array.isArray(slotData) && slotData.length > 0) {
              const entry = slotData[0];
              if (typeof entry === 'object') {
                cellContent = `${entry.course_code}\n${entry.instructor}\n${entry.room}`;
              } else {
                cellContent = entry;
              }
            } else if (typeof slotData === 'string') {
              cellContent = slotData;
            }
          }
        }
        
        row.push(cellContent || '-');
      });
      
      wsData.push(row);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Time column
      { wch: 20 }, // Monday
      { wch: 20 }, // Tuesday
      { wch: 20 }, // Wednesday
      { wch: 20 }, // Thursday
      { wch: 20 }  // Friday
    ];
    ws['!cols'] = colWidths;
    
    return ws;
  }
  
  static createScheduleSheet(scheduleData) {
    const wsData = [];
    
    // Header
    wsData.push(['Schedule Details']);
    wsData.push([]);
    wsData.push(['Subject', 'Course Code', 'Instructor', 'Room', 'Day', 'Time Slot', 'Day Index', 'Period']);
    
    // Data
    scheduleData.forEach(entry => {
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const timeSlots = [
        '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
        '2:00-3:00', '3:00-4:00', '4:00-5:00'
      ];
      
      wsData.push([
        entry.subject || '',
        entry.course_code || '',
        entry.instructor || '',
        entry.room || '',
        dayNames[entry.day] || '',
        timeSlots[entry.period] || '',
        entry.day || '',
        entry.period || ''
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Subject
      { wch: 15 }, // Course Code
      { wch: 20 }, // Instructor
      { wch: 15 }, // Room
      { wch: 15 }, // Day
      { wch: 15 }, // Time Slot
      { wch: 12 }, // Day Index
      { wch: 12 }  // Period
    ];
    
    return ws;
  }
  
  // Generate CSV data for backward compatibility
  static generateCSVData(timetableData, type = 'master', metadata = {}) {
    const timeSlots = [
      '9:00-10:00',
      '10:00-11:00', 
      '11:00-12:00',
      '12:00-1:00',
      '1:00-2:00 (LUNCH)',
      '2:00-3:00',
      '3:00-4:00',
      '4:00-5:00'
    ];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let csvContent = '';
    
    // Add metadata
    csvContent += `${type.charAt(0).toUpperCase() + type.slice(1)} Timetable\r\n`;
    if (metadata.name) csvContent += `Name: ${metadata.name}\r\n`;
    if (metadata.department) csvContent += `Department: ${metadata.department}\r\n`;
    if (metadata.semester) csvContent += `Semester: ${metadata.semester}\r\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\r\n\r\n`;
    
    // Header row
    csvContent += 'Time,' + days.join(',') + '\r\n';
    
    // Data rows
    timeSlots.forEach((timeSlot, slotIndex) => {
      let row = `"${timeSlot}"`;
      
      days.forEach((day, dayIndex) => {
        let cellContent = '';
        
        if (slotIndex === 4) { // Lunch break
          cellContent = 'LUNCH BREAK';
        } else {
          const actualSlotIndex = slotIndex > 4 ? slotIndex - 1 : slotIndex;
          
          if (timetableData.timetable && 
              timetableData.timetable[dayIndex] && 
              timetableData.timetable[dayIndex][actualSlotIndex]) {
            
            const slotData = timetableData.timetable[dayIndex][actualSlotIndex];
            
            if (Array.isArray(slotData) && slotData.length > 0) {
              const entry = slotData[0];
              if (typeof entry === 'object') {
                cellContent = `${entry.course_code} | ${entry.instructor} | ${entry.room}`;
              } else {
                cellContent = entry;
              }
            } else if (typeof slotData === 'string') {
              cellContent = slotData;
            }
          }
        }
        
        row += `,"${cellContent || '-'}"`;
      });
      
      csvContent += row + '\r\n';
    });
    
    return csvContent;
  }
}

module.exports = ExportUtils;