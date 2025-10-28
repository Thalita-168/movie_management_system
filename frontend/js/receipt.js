window.API_BASE_URL = 'http://127.0.0.1:5000/api';
class ReceiptGenerator {
    constructor() {
        this.bookingData = null;
        console.log('🧾 ReceiptGenerator initialized');
    }

    generateReceipt(bookingData) {
        console.log('🧾 Generating receipt for:', bookingData);
        this.bookingData = bookingData;
        this.populateReceipt();
        this.showReceipt();
        this.saveToStorage();
    }

    populateReceipt() {
        if (!this.bookingData) {
            console.error('❌ No booking data to populate receipt');
            return;
        }

        console.log('📝 Populating receipt fields...');

        try {
            // Populate receipt fields with null checks
            const elements = {
                'receiptNumber': this.bookingData.receiptNumber,
                'bookingId': this.bookingData.bookingId,
                'customerName': this.bookingData.customer.name,
                'customerEmail': this.bookingData.customer.email,
                'customerPhone': this.bookingData.customer.phone
            };

            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                } else {
                    console.error(`❌ Element #${id} not found`);
                }
            }

            // Set issue date
            const issueDate = document.getElementById('issueDate');
            if (issueDate) {
                issueDate.textContent = new Date().toLocaleDateString();
            }

            this.updateBookingDetails();
            this.updatePaymentSummary();
            console.log('✅ Receipt populated successfully');

        } catch (error) {
            console.error('❌ Error populating receipt:', error);
        }
    }

    updateBookingDetails() {
        const detailsBody = document.getElementById('bookingDetailsBody');
        if (!detailsBody) {
            console.error('❌ Could not find bookingDetailsBody');
            return;
        }

        console.log('📋 Updating booking details...');
        
        try {
            detailsBody.innerHTML = '';
            
            this.bookingData.seats.forEach(seat => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.bookingData.movieTitle || 'N/A'}</td>
                    <td>${seat}</td>
                    <td>${this.bookingData.bookingDate || new Date().toLocaleDateString()} at ${this.bookingData.showTime || 'N/A'}</td>
                    <td>${this.bookingData.theater || 'N/A'}</td>
                `;
                detailsBody.appendChild(row);
            });
        } catch (error) {
            console.error('❌ Error updating booking details:', error);
        }
    }

    updatePaymentSummary() {
        try {
            const subtotal = this.bookingData.totalAmount || 0;
            const tax = subtotal * 0.1;
            const total = subtotal + tax;

            console.log('💰 Updating payment summary...');

            const elements = {
                'subtotal': `$${subtotal.toFixed(2)}`,
                'tax': `$${tax.toFixed(2)}`,
                'totalAmount': `$${total.toFixed(2)}`
            };

            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                } else {
                    console.error(`❌ Payment element #${id} not found`);
                }
            }
        } catch (error) {
            console.error('❌ Error updating payment summary:', error);
        }
    }

    showReceipt() {
        try {
            const receiptSection = document.getElementById('receiptSection');
            const bookingContainer = document.querySelector('.booking-container');
            
            if (receiptSection && bookingContainer) {
                // Hide booking container
                bookingContainer.style.display = 'none';
                // Show receipt section
                receiptSection.style.display = 'block';
                
                // Scroll to receipt
                receiptSection.scrollIntoView({ behavior: 'smooth' });
                
                console.log('🎉 Receipt section is now visible');
            } else {
                console.error('❌ Could not find receipt section or booking container');
                if (!receiptSection) console.error('Missing: #receiptSection');
                if (!bookingContainer) console.error('Missing: .booking-container');
            }
        } catch (error) {
            console.error('❌ Error showing receipt:', error);
        }
    }

    saveToStorage() {
        try {
            const receipts = JSON.parse(localStorage.getItem('receipts') || '[]');
            receipts.push(this.bookingData);
            localStorage.setItem('receipts', JSON.stringify(receipts));
            console.log('💾 Receipt saved to storage');
        } catch (error) {
            console.error('❌ Error saving receipt to storage:', error);
        }
    }

    printReceipt() {
        try {
            console.log('🖨️ Printing receipt...');
            
            // Create a print-friendly version
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Receipt - ${this.bookingData.receiptNumber}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #333;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 30px;
                            border-bottom: 2px solid #333;
                            padding-bottom: 20px;
                        }
                        .company-name { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #2c3e50; 
                        }
                        .receipt-title { 
                            font-size: 20px; 
                            color: #7f8c8d; 
                        }
                        .section { 
                            margin: 20px 0; 
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 12px; 
                            text-align: left; 
                        }
                        th { 
                            background: #f8f9fa; 
                        }
                        .total { 
                            font-weight: bold; 
                            font-size: 18px; 
                            border-top: 2px solid #333;
                        }
                        .footer { 
                            margin-top: 30px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #666;
                        }
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-name">🎬 MyMovies Cinema</div>
                        <div class="receipt-title">BOOKING CONFIRMATION & RECEIPT</div>
                    </div>
                    
                    <div class="section">
                        <strong>Receipt Information:</strong><br>
                        Receipt No: ${this.bookingData.receiptNumber}<br>
                        Booking ID: ${this.bookingData.bookingId}<br>
                        Issue Date: ${new Date().toLocaleDateString()}
                    </div>
                    
                    <div class="section">
                        <strong>Customer Details:</strong><br>
                        Name: ${this.bookingData.customer.name}<br>
                        Email: ${this.bookingData.customer.email}<br>
                        Phone: ${this.bookingData.customer.phone}
                    </div>
                    
                    <div class="section">
                        <strong>Booking Details:</strong><br>
                        Movie: ${this.bookingData.movieTitle}<br>
                        Date: ${this.bookingData.bookingDate}<br>
                        Time: ${this.bookingData.showTime}<br>
                        Theater: ${this.bookingData.theater}
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Seat Number</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.bookingData.seats.map(seat => `
                                <tr>
                                    <td>${seat}</td>
                                    <td>$${(this.bookingData.seatPrice || 12).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="section">
                        <strong>Payment Summary:</strong><br>
                        Subtotal: $${(this.bookingData.totalAmount || 0).toFixed(2)}<br>
                        Tax (10%): $${((this.bookingData.totalAmount || 0) * 0.1).toFixed(2)}<br>
                        <span class="total">Total: $${((this.bookingData.totalAmount || 0) * 1.1).toFixed(2)}</span>
                    </div>
                    
                    <div class="footer">
                        Thank you for choosing MyMovies Cinema!<br>
                        Please present this receipt at the theater.<br>
                        🎉 Enjoy your movie! 🍿
                    </div>
                    
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
            
        } catch (error) {
            console.error('❌ Error printing receipt:', error);
            // Fallback to browser print
            window.print();
        }
    }

    downloadPDF() {
        try {
            if (!this.bookingData) {
                console.error('❌ No booking data for PDF');
                return;
            }

            console.log('📄 Generating PDF...');
            
            // Check if jsPDF is available
            if (typeof jsPDF !== 'undefined') {
                this.generateAdvancedPDF();
            } else {
                // Fallback to text file
                this.downloadTextReceipt();
            }
            
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            this.downloadTextReceipt();
        }
    }

    downloadTextReceipt() {
        try {
            const pdfContent = this.generatePDFContent();
            
            // Create blob and download
            const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${this.bookingData.receiptNumber}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Text receipt downloaded');
        } catch (error) {
            console.error('❌ Error downloading text receipt:', error);
        }
    }

    generatePDFContent() {
        const subtotal = this.bookingData.totalAmount || 0;
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        return `
🎬 MYMOVIES CINEMA - BOOKING RECEIPT
====================================

RECEIPT INFORMATION:
-------------------
Receipt No: ${this.bookingData.receiptNumber}
Booking ID: ${this.bookingData.bookingId}
Issue Date: ${new Date().toLocaleDateString()}

CUSTOMER DETAILS:
----------------
Name: ${this.bookingData.customer.name}
Email: ${this.bookingData.customer.email}
Phone: ${this.bookingData.customer.phone}

BOOKING DETAILS:
---------------
Movie: ${this.bookingData.movieTitle}
Date: ${this.bookingData.bookingDate}
Time: ${this.bookingData.showTime}
Theater: ${this.bookingData.theater}

SEATS BOOKED:
------------
${this.bookingData.seats.map(seat => `• ${seat} - $${(this.bookingData.seatPrice || 12).toFixed(2)}`).join('\n')}

PAYMENT SUMMARY:
---------------
Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
Total: $${total.toFixed(2)}

TERMS & CONDITIONS:
------------------
• Please arrive 15 minutes before showtime
• Present this receipt at the ticket counter
• Seats are non-refundable but can be exchanged 2 hours before showtime

Thank you for choosing MyMovies Cinema!
🎉 Enjoy your movie experience! 🍿

====================================
        `;
    }

    generateAdvancedPDF() {
        try {
            const doc = new jsPDF();
            
            // Set document properties
            doc.setProperties({
                title: `Receipt - ${this.bookingData.receiptNumber}`,
                subject: 'Movie Booking Receipt',
                author: 'MyMovies Cinema'
            });
            
            // Add header
            doc.setFontSize(20);
            doc.setTextColor(44, 62, 80);
            doc.text('MYMOVIES CINEMA', 105, 20, { align: 'center' });
            
            doc.setFontSize(16);
            doc.setTextColor(127, 140, 141);
            doc.text('BOOKING CONFIRMATION & RECEIPT', 105, 30, { align: 'center' });
            
            // Receipt information
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Receipt No: ${this.bookingData.receiptNumber}`, 20, 50);
            doc.text(`Booking ID: ${this.bookingData.bookingId}`, 20, 57);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 64);
            
            // Customer details
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text('CUSTOMER DETAILS:', 20, 80);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Name: ${this.bookingData.customer.name}`, 30, 90);
            doc.text(`Email: ${this.bookingData.customer.email}`, 30, 97);
            doc.text(`Phone: ${this.bookingData.customer.phone}`, 30, 104);
            
            // Booking details
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text('BOOKING DETAILS:', 20, 120);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Movie: ${this.bookingData.movieTitle}`, 30, 130);
            doc.text(`Date: ${this.bookingData.bookingDate}`, 30, 137);
            doc.text(`Time: ${this.bookingData.showTime}`, 30, 144);
            doc.text(`Theater: ${this.bookingData.theater}`, 30, 151);
            
            // Seats table
            let yPos = 170;
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text('SEATS BOOKED:', 20, yPos);
            
            yPos += 10;
            this.bookingData.seats.forEach((seat, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`• ${seat} - $${(this.bookingData.seatPrice || 12).toFixed(2)}`, 30, yPos);
                yPos += 7;
            });
            
            // Payment summary
            yPos += 10;
            const subtotal = this.bookingData.totalAmount || 0;
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text('PAYMENT SUMMARY:', 20, yPos);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 120, yPos, { align: 'right' });
            doc.text(`Tax (10%): $${tax.toFixed(2)}`, 120, yPos + 7, { align: 'right' });
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(`Total: $${total.toFixed(2)}`, 120, yPos + 17, { align: 'right' });
            
            // Footer
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(102, 102, 102);
            doc.text('Thank you for choosing MyMovies Cinema!', 105, 280, { align: 'center' });
            doc.text('Please present this receipt at the theater.', 105, 285, { align: 'center' });
            
            // Save PDF
            doc.save(`receipt-${this.bookingData.receiptNumber}.pdf`);
            console.log('✅ Advanced PDF generated and downloaded');
            
        } catch (error) {
            console.error('❌ Error generating advanced PDF:', error);
            // Fallback to text download
            this.downloadTextReceipt();
        }
    }

    // Get all receipts from storage
    static getReceipts() {
        try {
            return JSON.parse(localStorage.getItem('receipts') || '[]');
        } catch (error) {
            console.error('❌ Error getting receipts from storage:', error);
            return [];
        }
    }

    // Get receipt by ID
    static getReceiptById(receiptNumber) {
        const receipts = this.getReceipts();
        return receipts.find(receipt => receipt.receiptNumber === receiptNumber);
    }
}

// Initialize receipt generator
window.receiptGenerator = new ReceiptGenerator();

// Function to go back to seat selection
function goBackToSeats() {
    try {
        console.log('🔙 Going back to seat selection');
        const receiptSection = document.getElementById('receiptSection');
        const bookingContainer = document.querySelector('.booking-container');
        
        if (receiptSection && bookingContainer) {
            receiptSection.style.display = 'none';
            bookingContainer.style.display = 'block';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Could not find sections to navigate back');
        }
    } catch (error) {
        console.error('❌ Error going back to seats:', error);
    }
}

// Function to show receipt by ID (for booking history)
function showReceipt(receiptNumber) {
    try {
        const receipt = ReceiptGenerator.getReceiptById(receiptNumber);
        if (receipt) {
            window.receiptGenerator.generateReceipt(receipt);
        } else {
            console.error('❌ Receipt not found:', receiptNumber);
            alert('Receipt not found!');
        }
    } catch (error) {
        console.error('❌ Error showing receipt:', error);
    }
}

console.log('🧾 receipt.js loaded successfully');