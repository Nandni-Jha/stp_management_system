import React, { useState, useRef, useEffect } from 'react';
import { createPopper } from '@popperjs/core';

const Dropdown = ({ placement = 'bottom-start', btnClassName, button, children, className }) => {
    const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
    const btnDropdownRef = useRef(null);
    const popoverDropdownRef = useRef(null);
    const popperInstance = useRef(null);

    useEffect(() => {
        if (dropdownPopoverShow && btnDropdownRef.current && popoverDropdownRef.current) {
            popperInstance.current = createPopper(
                btnDropdownRef.current,
                popoverDropdownRef.current,
                {
                    placement,
                }
            );
        }
        return () => {
            if (popperInstance.current) {
                popperInstance.current.destroy();
                popperInstance.current = null;
            }
        };
    }, [dropdownPopoverShow, placement]);

    const openDropdownPopover = () => {
        if (!dropdownPopoverShow) {
            setDropdownPopoverShow(true);
        }
    };

    const closeDropdownPopover = () => {
        if (dropdownPopoverShow) {
            setDropdownPopoverShow(false);
        }
    };

    const toggleDropdownPopover = () => {
        if (dropdownPopoverShow) {
            closeDropdownPopover();
        } else {
            openDropdownPopover();
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownPopoverShow &&
                btnDropdownRef.current &&
                popoverDropdownRef.current &&
                !btnDropdownRef.current.contains(event.target) &&
                !popoverDropdownRef.current.contains(event.target)
            ) {
                closeDropdownPopover();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && dropdownPopoverShow) {
                closeDropdownPopover();
            }
        };

        if (dropdownPopoverShow) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [dropdownPopoverShow]);

    return (
        <div className={`relative inline-block ${className || ''}`}>
            <button
                ref={btnDropdownRef}
                className={`text-sm font-normal transition duration-150 ease-in-out ${btnClassName || ''}`}
                onClick={toggleDropdownPopover}
            >
                {button}
            </button>
            <div
                ref={popoverDropdownRef}
                className={
                    (dropdownPopoverShow ? 'block ' : 'hidden ') +
                    'bg-white z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48'
                }
            >
                {children}
            </div>
        </div>
    );
};

export default Dropdown;
