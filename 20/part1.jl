function draw(grid::AbstractArray{Char,2})
    io = IOBuffer()
    for y ∈ axes(grid, 1)
        for x ∈ axes(grid, 2)
            print(io, grid[y,x])
        end
        println(io)
    end
    println(String(take!(io)))
end

function in_bounds(grid::AbstractArray{T,2}, pos::Vector{Int}) where {T}
    all(i->pos[i] ∈ axes(grid, 1), length(pos))
end

function get_neighbours(pos::Vector{Int})
    [
        [ pos[1] + 1, pos[2]     ],
        [ pos[1],     pos[2] + 1 ],
        [ pos[1] - 1, pos[2]     ],
        [ pos[1],     pos[2] - 1 ]
    ]
end

function get_neighbours_in_bounds(grid::AbstractArray{T,2}, pos::Vector{Int}) where {T}
    filter!(p->in_bounds(grid, p), get_neighbours(pos))
end

function load_grid(filename)
    open(filename, "r") do file
        permutedims(hcat(collect.(String.(split(read(file, String), '\n', keepempty = false)))...))
    end
end

function make_distance_grid(grid::AbstractArray{Char,2},
        from::Vector{Int},
        teleporters::Dict{Tuple{Int,Int},Vector{Int}},
        walkable::Set{Char} = Set('.'))

    distance_grid = fill(-1, size(grid, 1), size(grid, 2))
    distance_grid[from...] = 0
    Q = [from]
    while !isempty(Q)
        v = pop!(Q)
        dist_v = distance_grid[v...]
        for n ∈ get_neighbours_in_bounds(distance_grid, [v[1],v[2]])
            if distance_grid[n...] < 0 && grid[n...] ∈ walkable
                distance_grid[n...] = dist_v + 1
                pushfirst!(Q, n)
            end
        end
        if haskey(teleporters, (v[1], v[2]))
            n = teleporters[(v[1], v[2])]
            if distance_grid[n...] < 0 && grid[n...] ∈ walkable
                distance_grid[n...] = dist_v + 1
                pushfirst!(Q, n)
            end
        end
    end
    return distance_grid
end

function update_teleporters!(teleporters::Dict{Tuple{Int,Int},Vector{Int}},
        pos::Vector{Int}, teleporter_name::String,
        temp::Dict{String,Vector{Int}})
    
    if haskey(temp, teleporter_name)
        pos2 = temp[teleporter_name]
        teleporters[(pos[1], pos[2])] = copy(pos2)
        teleporters[(pos2[1], pos2[2])] = copy(pos)
        delete!(temp, teleporter_name)
    else
        temp[teleporter_name] = copy(pos)
    end
end

function find_hole_corners(grid::AbstractArray{Char,2})
    start = Vector{Int}()
    last = Vector{Int}()
    for y ∈ axes(grid, 1)
        for x ∈ axes(grid, 2)
            if (isempty(start) &&
               grid[y,x] == '#' &&
               grid[y + 1,x] == '#' &&
               grid[y,x + 1] == '#' &&
               (grid[y + 1,x + 1] == ' ' || isuppercase(grid[y + 1,x + 1])))

                start = [y,x]
            elseif (isempty(last) &&
                grid[y,x] == '#' &&
                grid[y - 1,x] == '#' &&
                grid[y,x - 1] == '#' &&
                (grid[y - 1,x - 1] == ' ' || isuppercase(grid[y - 1,x - 1])))
                
                last = [y,x]
            end
        end
    end
    return (start, last)
end

function find_teleporters(grid::AbstractArray{Char,2})
    teleporters = Dict{Tuple{Int,Int},Vector{Int}}()
    temp = Dict{String,Vector{Int}}()

    # And the award for the ugliest code goes to...
    # Hey, it works!

    # Around the outer edges
    start = findfirst(==('#'), grid)
    last = findlast(==('#'), grid)
    pos = [start[1],start[2]]
    # Left edge
    while pos[1] != last[1]
        pos[1] += 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1],pos[2] - 2],grid[pos[1],pos[2] - 1]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Bottom edge
    while pos[2] != last[2]
        pos[2] += 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1] + 1,pos[2]],grid[pos[1] + 2,pos[2]]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Right edge
    while pos[1] != start[1]
        pos[1] -= 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1],pos[2] + 1],grid[pos[1],pos[2] + 2]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Top edge
    while pos[2] != start[2]
        pos[2] -= 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1] - 2,pos[2]],grid[pos[1] - 1,pos[2]]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end

    # Now around the hole
    start, last = find_hole_corners(grid)
    pos = [start[1],start[2]]
    # Left edge
    while pos[1] != last[1]
        pos[1] += 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1],pos[2] + 1],grid[pos[1],pos[2] + 2]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Bottom edge
    while pos[2] != last[2]
        pos[2] += 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1] - 2,pos[2]],grid[pos[1] - 1,pos[2]]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Right edge
    while pos[1] != start[1]
        pos[1] -= 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1],pos[2] - 2],grid[pos[1],pos[2] - 1]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end
    # Top edge
    while pos[2] != start[2]
        pos[2] -= 1
        if grid[pos...] == '.'
            teleporter_name = join([grid[pos[1] + 1,pos[2]],grid[pos[1] + 2,pos[2]]])
            update_teleporters!(teleporters, pos, teleporter_name, temp)
        end
    end

    return (teleporters, temp["AA"], temp["ZZ"])
end

function main()
    grid = load_grid("input.txt")
    draw(grid)

    teleporters, AA, ZZ = find_teleporters(grid)
    distance_grid = make_distance_grid(grid, AA, teleporters)
    display(distance_grid); println()
    
    println("PART 1: ", distance_grid[ZZ...])
end

main()