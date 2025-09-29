const jsPDF = require('jspdf');
require('jspdf-autotable');

class PDFUtils {
  static generateTimetablePDF(timetableData, type = 'master', metadata = {}) {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Timetable`;
      doc.text(title, 148, 20, { align: 'center' }); // Center horizontally
      
      // Metadata
      let yPosition = 35;
      doc.setFontSize(10);
      
      if (metadata.name) {
        doc.text(`Name: ${metadata.name}`, 20, yPosition);
        yPosition += 5;
      }
      if (metadata.department) {
        doc.text(`Department: ${metadata.department}`, 20, yPosition);
        yPosition += 5;
      }
      if (metadata.semester) {
        doc.text(`Semester: ${metadata.semester}`, 20, yPosition);
        yPosition += 5;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      
      // Timetable data
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
      
      // Prepare table data
      const tableData = [];
      const headers = ['Time', ...days];
      
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
        
        tableData.push(row);
      });
      
      // Generate table
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'top'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' }, // Time column
          1: { cellWidth: 45 }, // Monday
          2: { cellWidth: 45 }, // Tuesday
          3: { cellWidth: 45 }, // Wednesday
          4: { cellWidth: 45 }, // Thursday
          5: { cellWidth: 45 }  // Friday
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didParseCell: function(data) {
          // Special formatting for lunch break
          if (data.cell.text[0] === 'LUNCH BREAK') {
            data.cell.styles.fillColor = [255, 235, 59];
            data.cell.styles.textColor = [33, 33, 33];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 
          doc.internal.pageSize.getWidth() - 30, 
          doc.internal.pageSize.getHeight() - 10);
      }
      
      return doc.output();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}

module.exports = PDFUtils;