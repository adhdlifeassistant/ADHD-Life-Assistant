// Keyboard navigation utilities for ADHD Life Assistant
export class KeyboardNavigationService {
  private static instance: KeyboardNavigationService;
  private focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  static getInstance(): KeyboardNavigationService {
    if (!KeyboardNavigationService.instance) {
      KeyboardNavigationService.instance = new KeyboardNavigationService();
    }
    return KeyboardNavigationService.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeGlobalKeyboardHandlers();
    }
  }

  private initializeGlobalKeyboardHandlers() {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('keydown', (e) => {
      // Global escape key handler for modals
      if (e.key === 'Escape') {
        this.handleEscape();
      }
    });
  }

  /**
   * Handle escape key press - closes modals and dropdowns
   */
  private handleEscape() {
    // Find and close any open modals
    const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
    modals.forEach((modal) => {
      const closeButton = modal.querySelector('button[aria-label*="Fermer"], button[aria-label*="fermer"]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    });

    // Find and close any expanded dropdowns or menus
    const expandedElements = document.querySelectorAll('[aria-expanded="true"]');
    expandedElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.click();
      }
    });
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: Element): HTMLElement[] {
    const elements = container.querySelectorAll(this.focusableSelectors);
    return Array.from(elements).filter(
      (element): element is HTMLElement => 
        element instanceof HTMLElement && 
        !('disabled' in element && element.disabled) && 
        !element.hidden &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
    );
  }

  /**
   * Trap focus within a container (for modals)
   */
  trapFocus(container: Element, event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Navigate through a group of elements with arrow keys
   */
  handleArrowNavigation(
    container: Element, 
    event: KeyboardEvent, 
    orientation: 'horizontal' | 'vertical' | 'both' = 'both'
  ) {
    const { key } = event;
    const isHorizontalKey = key === 'ArrowLeft' || key === 'ArrowRight';
    const isVerticalKey = key === 'ArrowUp' || key === 'ArrowDown';

    if (!isHorizontalKey && !isVerticalKey) return;

    if (orientation === 'horizontal' && !isHorizontalKey) return;
    if (orientation === 'vertical' && !isVerticalKey) return;

    event.preventDefault();

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
    }

    focusableElements[newIndex]?.focus();
  }

  /**
   * Handle radio group navigation
   */
  handleRadioGroupNavigation(event: KeyboardEvent) {
    const { key, target } = event;
    if (!target || !(target instanceof HTMLElement)) return;

    const radioGroup = target.closest('[role="radiogroup"]');
    if (!radioGroup) return;

    const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
    if (!isArrowKey) return;

    event.preventDefault();

    const radios = radioGroup.querySelectorAll('[role="radio"]');
    const radioArray = Array.from(radios) as HTMLElement[];
    const currentIndex = radioArray.indexOf(target);

    let newIndex: number;
    if (key === 'ArrowUp' || key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : radioArray.length - 1;
    } else {
      newIndex = currentIndex < radioArray.length - 1 ? currentIndex + 1 : 0;
    }

    const newRadio = radioArray[newIndex];
    if (newRadio) {
      newRadio.focus();
      newRadio.click(); // Select the radio button
    }
  }

  /**
   * Handle tab panel navigation
   */
  handleTabNavigation(event: KeyboardEvent) {
    const { key, target } = event;
    if (!target || !(target instanceof HTMLElement)) return;

    const tabList = target.closest('[role="tablist"]');
    if (!tabList || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;

    event.preventDefault();

    const tabs = tabList.querySelectorAll('[role="tab"]');
    const tabArray = Array.from(tabs) as HTMLElement[];
    const currentIndex = tabArray.indexOf(target);

    let newIndex: number;
    switch (key) {
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabArray.length - 1;
        break;
      case 'ArrowRight':
        newIndex = currentIndex < tabArray.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabArray.length - 1;
        break;
      default:
        return;
    }

    const newTab = tabArray[newIndex];
    if (newTab) {
      newTab.focus();
      newTab.click(); // Activate the tab
    }
  }

  /**
   * Initialize keyboard navigation for a specific component
   */
  initializeComponent(component: Element, options: {
    trapFocus?: boolean;
    arrowNavigation?: 'horizontal' | 'vertical' | 'both';
    radioGroups?: boolean;
    tabList?: boolean;
  } = {}) {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus trapping
      if (options.trapFocus && event.key === 'Tab') {
        this.trapFocus(component, event);
      }

      // Arrow navigation
      if (options.arrowNavigation) {
        this.handleArrowNavigation(component, event, options.arrowNavigation);
      }

      // Radio group navigation
      if (options.radioGroups) {
        this.handleRadioGroupNavigation(event);
      }

      // Tab list navigation
      if (options.tabList) {
        this.handleTabNavigation(event);
      }
    };

    component.addEventListener('keydown', handleKeyDown as EventListener);

    // Return cleanup function
    return () => {
      component.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }

  /**
   * Focus the first focusable element in a container
   */
  focusFirst(container: Element): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }

  /**
   * Focus the last focusable element in a container
   */
  focusLast(container: Element): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }

  /**
   * Skip to main content functionality
   */
  skipToMainContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

export const keyboardNavService = KeyboardNavigationService.getInstance();