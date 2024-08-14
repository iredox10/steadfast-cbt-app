{{-- <div>
    <!-- He who is contented is rich. - Laozi -->
    {{-- <input type="{{$type}}" name="{{$name}}" placeholder="{{$placeholder}}" class="border border-1 border-black capitalize p-1 w-full" {{$attributes}}> --}}
    {{-- <label for="{{$labelFor}}">{{$label}}</label>
    <input type="{{$type}}" name="{{$name}}" placeholder="{{$placeholder}}" class="capitalize p-4">
</div> --}} 


<div>
    <!-- He who is contented is rich. - Laozi -->
    <label for="{{$labelFor}}">{{$label}}</label>
    <input type="{{$type}}" 
           name="{{$name}}" 
           id="{{$labelFor}}" 
           placeholder="{{$placeholder}}" 
           class="capitalize p-4" 
           {{$attributes}}>
</div>
