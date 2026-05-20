import Swal from 'sweetalert2';

export const confirmDelete = async (message = 'Are you sure you want to delete this item?') => {
    return await Swal.fire({
        title: 'Confirm Delete',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
    });
};

export const showSuccess = (message) => {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        timer: 3000,
        showConfirmButton: false,
    });
};

export const showError = (message, errors = null) => {
    // If errors object exists (validation errors), format them as HTML list
    let htmlContent = null;
    if (errors && typeof errors === 'object') {
        const errorList = Object.values(errors)
            .flat()
            .map((error) => `<li class="text-left">${error}</li>`)
            .join('');
        htmlContent = `<ul class="list-disc list-inside">${errorList}</ul>`;
    }

    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: !htmlContent ? message : undefined,
        html: htmlContent || undefined,
        confirmButtonColor: '#d33',
    });
};

export const showWarning = (message) => {
    Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: message,
        confirmButtonColor: '#f39c12',
    });
};

export const showInfo = (message) => {
    Swal.fire({
        icon: 'info',
        title: 'Info',
        text: message,
        confirmButtonColor: '#3498db',
    });
};
