// Kept apart from dil.ts (which uses React hooks) so the server layout can import it.
export const DIL_ANAHTAR = "fx_dil";

// Runs before the page is painted (app/layout.tsx). Must decide exactly like algila() in dil.ts.
export const DIL_BETIGI = `(function(){try{var d=null;try{d=localStorage.getItem("${DIL_ANAHTAR}")}catch(e){}if(d!=="tr"&&d!=="en"){var l=(navigator.languages&&navigator.languages[0])||navigator.language||"";d=/^tr/i.test(l)?"tr":"en"}document.documentElement.lang=d;if(d==="en"){var h=document.documentElement;h.classList.add("dil-bekle");setTimeout(function(){h.classList.remove("dil-bekle")},2500)}}catch(e){}})();`;
